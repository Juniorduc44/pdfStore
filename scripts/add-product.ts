import { copyFile, mkdir, readFile, stat, writeFile } from 'fs/promises'
import path from 'path'
import readline from 'readline/promises'
import { stdin as input, stdout as output } from 'process'

import type { Product, ProductStatus } from '../types/product'

const APP_ROOT = process.cwd()
const DATA_PATH = path.join(APP_ROOT, 'data', 'products.json')
const PRIVATE_PDF_DIR = path.join(APP_ROOT, 'storage', 'pdfs')
const COVER_DIR = path.join(APP_ROOT, 'public', 'uploads', 'covers')
const PREVIEW_DIR = path.join(APP_ROOT, 'public', 'uploads', 'previews')

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toPublicPath(...parts: string[]): string {
  return `/${parts.join('/')}`
}

async function loadProducts(): Promise<Product[]> {
  const file = await readFile(DATA_PATH, 'utf8')
  return JSON.parse(file) as Product[]
}

async function saveProducts(products: Product[]): Promise<void> {
  await writeFile(DATA_PATH, `${JSON.stringify(products, null, 2)}\n`, 'utf8')
}

async function ensureDirectories(): Promise<void> {
  await Promise.all([
    mkdir(PRIVATE_PDF_DIR, { recursive: true }),
    mkdir(COVER_DIR, { recursive: true }),
    mkdir(PREVIEW_DIR, { recursive: true })
  ])
}

function extensionFor(filePath: string): string {
  return path.extname(filePath).toLowerCase()
}

async function promptBoolean(
  rl: readline.Interface,
  question: string,
  defaultValue: boolean
): Promise<boolean> {
  const fallback = defaultValue ? 'Y/n' : 'y/N'
  const answer = (await rl.question(`${question} [${fallback}]: `))
    .trim()
    .toLowerCase()

  if (answer.length === 0) {
    return defaultValue
  }

  return ['y', 'yes'].includes(answer)
}

async function promptRequired(
  rl: readline.Interface,
  question: string
): Promise<string> {
  while (true) {
    const answer = (await rl.question(`${question}: `)).trim()

    if (answer.length > 0) {
      return answer
    }

    output.write('A value is required.\n')
  }
}

async function promptRequiredFilePath(
  rl: readline.Interface,
  question: string
): Promise<string> {
  while (true) {
    const filePath = (await rl.question(`${question}: `)).trim()

    if (filePath.length === 0) {
      output.write('A file path is required.\n')
      continue
    }

    try {
      const fileStats = await stat(filePath)

      if (!fileStats.isFile()) {
        output.write('That path is not a file.\n')
        continue
      }

      return filePath
    } catch {
      output.write('File not found.\n')
    }
  }
}

async function promptOptionalNumber(
  rl: readline.Interface,
  question: string
): Promise<number | undefined> {
  const answer = (await rl.question(`${question}: `)).trim()

  if (answer.length === 0) {
    return undefined
  }

  const parsed = Number(answer)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    output.write('Ignoring invalid number.\n')
    return undefined
  }

  return Math.floor(parsed)
}

async function main() {
  await ensureDirectories()

  const rl = readline.createInterface({ input, output })

  try {
    const title = await promptRequired(rl, 'Title')
    const slugInput = await rl.question(`Slug [${slugify(title)}]: `)
    const slug = slugify(slugInput || title)
    const description = await promptRequired(rl, 'Short description')
    const details = await promptRequired(rl, 'Detailed product copy')
    const author = (await rl.question('Author (optional): ')).trim() || undefined
    const priceSats = Number(await promptRequired(rl, 'Price in sats'))
    const tagsInput = await rl.question('Tags (comma-separated): ')
    const pageCount = await promptOptionalNumber(rl, 'Page count (optional)')
    const featured = await promptBoolean(rl, 'Feature this product on the storefront', false)
    const previewEnabled = await promptBoolean(rl, 'Enable preview', true)
    const pdfSource = await promptRequiredFilePath(rl, 'Path to PDF file')
    const coverSource = await promptRequiredFilePath(rl, 'Path to cover image')
    const previewSource = previewEnabled
      ? await promptRequiredFilePath(rl, 'Path to preview PDF excerpt')
      : ''
    const status = (
      await rl.question('Status [live/draft, default live]: ')
    ).trim().toLowerCase() as ProductStatus

    if (!Number.isFinite(priceSats) || priceSats <= 0) {
      throw new Error('Price must be a positive number of sats.')
    }

    const products = await loadProducts()

    if (products.some((product) => product.slug === slug)) {
      throw new Error(`A product with slug "${slug}" already exists.`)
    }

    const pdfExt = extensionFor(pdfSource) || '.pdf'
    const coverExt = extensionFor(coverSource) || '.jpg'
    const previewExt = previewSource ? extensionFor(previewSource) || '.pdf' : pdfExt

    const pdfTarget = path.join(PRIVATE_PDF_DIR, `${slug}${pdfExt}`)
    const coverTarget = path.join(COVER_DIR, `${slug}${coverExt}`)
    const previewTarget = previewEnabled
      ? path.join(PREVIEW_DIR, `${slug}${previewExt}`)
      : undefined

    await copyFile(pdfSource, pdfTarget)
    await copyFile(coverSource, coverTarget)

    if (previewEnabled && previewTarget) {
      if (path.resolve(previewSource) === path.resolve(pdfSource)) {
        throw new Error('Preview PDF must be a separate file from the paid PDF.')
      }

      await copyFile(previewSource, previewTarget)
    }

    const pdfStats = await stat(pdfTarget)
    const tags = tagsInput
      .split(',')
      .map((tag) => slugify(tag))
      .filter(Boolean)

    const product: Product = {
      id: slug,
      slug,
      title,
      description,
      details,
      priceSats: Math.floor(priceSats),
      coverImage: toPublicPath('uploads', 'covers', path.basename(coverTarget)),
      pdfPath: path.join('storage', 'pdfs', path.basename(pdfTarget)),
      previewEnabled,
      previewPath: previewEnabled && previewTarget
        ? toPublicPath('uploads', 'previews', path.basename(previewTarget))
        : undefined,
      downloadFileName: `${slug}.pdf`,
      tags,
      author,
      pageCount,
      fileSizeBytes: pdfStats.size,
      featured,
      status: status === 'draft' ? 'draft' : 'live',
      createdAt: new Date().toISOString()
    }

    products.push(product)
    await saveProducts(products)

    output.write(`\nAdded "${title}" to the storefront.\n`)
    output.write(`Catalog entry: ${slug}\n`)
    output.write(`Private PDF copied to: ${product.pdfPath}\n`)
    output.write(`Cover copied to: ${product.coverImage}\n`)
    if (product.previewEnabled) {
      output.write(`Preview: ${product.previewPath}\n`)
    }
  } finally {
    rl.close()
  }
}

main().catch((error) => {
  console.error(`Failed to add product: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
