-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "colorCode" TEXT,
    "primaryImage" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variantId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_active_idx" ON "Category"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_featured_idx" ON "Product"("featured");

-- CreateIndex
CREATE INDEX "Product_available_idx" ON "Product"("available");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_colorName_idx" ON "ProductVariant"("colorName");

-- CreateIndex
CREATE INDEX "ProductVariant_available_idx" ON "ProductVariant"("available");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_colorName_key" ON "ProductVariant"("productId", "colorName");

-- CreateIndex
CREATE INDEX "ProductImage_variantId_idx" ON "ProductImage"("variantId");

-- CreateIndex
CREATE INDEX "ProductImage_sortOrder_idx" ON "ProductImage"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_variantId_imageUrl_key" ON "ProductImage"("variantId", "imageUrl");
