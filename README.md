# UNIQUE STUDIOS - Premium Streetwear E-Commerce Platform

A complete, production-ready e-commerce website for UNIQUE STUDIOS, a modern oversized streetwear clothing brand. Built with Next.js, TypeScript, PostgreSQL, and Prisma.

## 🚀 Features

### Customer Features
- **Product Browsing**: Shop all products with advanced filtering and sorting
- **Product Details**: Detailed product pages with size/color selection
- **Shopping Cart**: Add/remove items, update quantities
- **Guest Checkout**: Complete checkout without account registration
- **Cash on Delivery**: Simple payment method
- **Order Tracking**: Order confirmation with order numbers
- **Wishlist**: Save favorite items (localStorage)
- **Search**: Full product search functionality
- **Size Guide**: Comprehensive size recommendations
- **Bilingual Support**: English and Arabic with full RTL support
- **Responsive Design**: Mobile-first, works on all devices

### Admin Features
- **Dashboard**: Overview of orders, revenue, and inventory
- **Order Management**: View, update order status, manage customer info
- **Product Management**: Create, read, update, delete products
- **Category Management**: Manage product categories
- **Inventory Management**: Track stock levels, low stock alerts
- **Authentication**: Secure admin login with session management

## 🛠️ Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Styling
- **Framer Motion**: Animations
- **Lucide React**: Icons
- **next-intl**: Internationalization

### Backend
- **Next.js API Routes**: Server-side functionality
- **TypeScript**: Type safety

### Database
- **PostgreSQL**: Relational database
- **Prisma ORM**: Database toolkit and migrations

### Validation & Forms
- **Zod**: Schema validation
- **React Hook Form**: Form management
- **@hookform/resolvers**: Zod integration

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unique-studios
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/unique_studios?schema=public"
   AUTH_SECRET="your-secret-key-change-this-in-production"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👤 Admin Access

### Default Admin Credentials
- **Email**: admin@uniquestudios.com
- **Password**: admin123

⚠️ **IMPORTANT**: Change the admin password before production!

### Accessing Admin Panel
1. Navigate to `/admin/login`
2. Enter the admin credentials
3. Access the dashboard at `/admin/dashboard`

## 📁 Project Structure

```
unique-studios/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed data
├── public/
│   └── images/
│       └── products/           # Product images
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── admin/            # Admin pages
│   │   ├── api/              # API routes
│   │   ├── cart/             # Cart page
│   │   ├── checkout/         # Checkout page
│   │   ├── product/          # Product pages
│   │   ├── shop/             # Shop page
│   │   └── ...               # Other pages
│   ├── components/
│   │   ├── admin/            # Admin components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── messages/             # Translation files
│   └── types/                # TypeScript types
├── env.example               # Environment variables template
└── package.json              # Dependencies
```

## 🗄️ Database Schema

### Models
- **Admin**: Admin users with authentication
- **Category**: Product categories
- **Product**: Main product information
- **ProductImage**: Product images
- **ProductVariant**: Size/color variants with stock
- **Order**: Customer orders
- **OrderItem**: Items within orders

### Key Relationships
- Category → Products (one-to-many)
- Product → Images (one-to-many)
- Product → Variants (one-to-many)
- Order → OrderItems (one-to-many)
- Product → OrderItems (one-to-many)

## 🌍 Internationalization (i18n)

### Supported Languages
- English (default)
- Arabic

### Translation Files
- `src/messages/en.json` - English translations
- `src/messages/ar.json` - Arabic translations

### RTL Support
The application automatically switches to RTL layout when Arabic is selected, including:
- Text direction
- Typography (Cairo font for Arabic)
- Layout adjustments
- Icon and button positioning

### Adding Translations
1. Edit the appropriate JSON file in `src/messages/`
2. Keys are organized by feature (common, nav, product, etc.)
3. Use the `t()` function in components to access translations

## 🛍️ Product Management

### Adding Products via Admin
1. Go to `/admin/products`
2. Click "Add Product"
3. Fill in product details
4. Add images and variants
5. Save

### Adding Products via Database
1. Edit `prisma/seed.ts`
2. Add product data following the existing pattern
3. Run `npm run db:seed`

### Product Images
1. Place images in `public/images/products/`
2. Name them according to product slug
3. Update database URLs accordingly

## 📦 Inventory Management

### Stock Tracking
- Each product variant tracks stock separately
- Low stock alerts appear when stock ≤ 5
- Out of stock items are disabled for purchase

### Updating Stock
1. Go to `/admin/inventory`
2. View all variants and stock levels
3. Or edit product variants individually

## 🎨 Customization

### Brand Information
Edit brand text in:
- Translation files (`src/messages/`)
- Component files (search for brand-specific text)
- Seed data (`prisma/seed.ts`)

### Styling
- Main styles: `src/app/globals.css`
- Component styles: Tailwind classes in components
- Design system: `src/components/ui/`

### Colors and Fonts
- Colors: Tailwind configuration
- Fonts: `src/app/layout.tsx` (Inter for English, Cairo for Arabic)

## 🔐 Security

### Authentication
- Admin login with hashed passwords
- Session-based authentication
- Protected admin routes via middleware
- Secure cookie handling

### Best Practices
- Environment variables for secrets
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection via React

## 🧪 Testing

### Manual Testing Checklist
- [ ] Customer can browse products
- [ ] Customer can view product details
- [ ] Customer can add items to cart
- [ ] Customer can complete checkout
- [ ] Order appears in admin dashboard
- [ ] Admin can update order status
- [ ] Admin can manage products
- [ ] Arabic language works correctly
- [ ] RTL layout works properly
- [ ] Mobile responsive design
- [ ] Wishlist functionality
- [ ] Search functionality

### Running Tests
```bash
# Type checking
npm run build

# Linting
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
1. Build the project: `npm run build`
2. Start production server: `npm run start`
3. Set up PostgreSQL database
4. Configure environment variables
5. Run migrations: `npm run db:migrate`
6. Seed database: `npm run db:seed`

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## 🔮 Future Enhancements

The architecture is ready for:
- Online payment integration (Stripe, PayPal)
- Real shipping company integration
- Order tracking system
- SMS/WhatsApp notifications
- Email notifications
- Cloudinary/S3 image uploads
- Customer accounts
- Discount codes and coupons
- Product reviews and ratings
- Multiple currencies
- Advanced analytics

## 🐛 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database credentials

### Build Errors
- Run `npm run db:generate` to regenerate Prisma Client
- Check TypeScript errors with `npm run build`
- Ensure all dependencies are installed

### Admin Login Issues
- Verify admin user exists in database
- Check password hash in database
- Reseed database if needed: `npm run db:seed`

## 📄 License

This project is proprietary software for UNIQUE STUDIOS.

## 🤝 Support

For support and questions:
- Email: info@uniquestudios.com
- Phone: +20 123 456 7890

---

Built with ❤️ for UNIQUE STUDIOS