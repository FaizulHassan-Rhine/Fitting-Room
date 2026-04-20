# The Fitting Room Platform

A minimalistic, professional 2D fitting room platform for clothing built with Next.js, TypeScript, and Tailwind CSS.

## Features

### For Consumers
- Browse clothing from verified brands
- 2D fitting room feature
- Filter by category and size
- Free to use
- Secure image storage
- Privacy-focused design

### For Brands
- Product management dashboard
- Upload and manage clothing items
- Track analytics and engagement
- Credit system for promotions
- Brand profile customization

### For Admins
- Brand approval system
- Category management
- Sensitive category verification controls
- Platform analytics and monitoring

## Design Philosophy

- **Minimalistic**: Black, white, and gray color palette only
- **Responsive**: Mobile-first design approach
- **SEO Optimized**: Semantic HTML and meta tags
- **Accessible**: WCAG compliant
- **Fast**: Optimized performance

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
/app
  /auth           - Authentication pages (login, register)
  /browse         - Product browsing
  /product/[id]   - Product details
  /try-on         - Fitting room interface
  /dashboard
    /brand        - Brand dashboard
    /admin        - Admin panel
  /about          - About page
  /brands         - For brands landing page
  /privacy        - Privacy policy
  /terms          - Terms of service
/components       - Reusable components
  Header.tsx
  Footer.tsx
```

## Technology Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter

## Color Palette

- Black: `#000000`
- White: `#FFFFFF`
- Dark Gray: `#1A1A1A`
- Medium Gray: `#6B6B6B`
- Light Gray: `#E5E5E5`

## Key Pages

- `/` - Homepage
- `/browse` - Browse products
- `/product/[id]` - Product details
- `/try-on` - The Fitting Room
- `/auth/login` - Login
- `/auth/register` - Register
- `/dashboard/brand` - Brand dashboard
- `/dashboard/admin` - Admin panel

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add your environment variables here
# DATABASE_URL=
# NEXTAUTH_SECRET=
# NEXTAUTH_URL=
```

## Features to Implement

This is a frontend implementation. To make it fully functional, you'll need to add:

1. **Backend API**: Set up API routes or external backend
2. **Database**: PostgreSQL/MongoDB for storing users, products, brands
3. **Authentication**: NextAuth.js or similar
4. **Image Upload**: AWS S3, Cloudinary, or similar
5. **Fitting Room Logic**: ML model integration for actual fitting room functionality
6. **Payment System**: Stripe/PayPal for brand credits

## License

Private - All rights reserved

## Contact

For questions or support, contact: support@vto-platform.com

