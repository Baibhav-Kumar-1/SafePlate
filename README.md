# SafePlate - Smart Menu Scanner

SafePlate is an intelligent menu scanning application that helps users identify potential allergens in restaurant dishes. Using OCR and NLP technology, it processes menu images and provides allergen warnings based on user preferences.

## Features

- Menu image scanning with OCR
- Intelligent dish and ingredient extraction
- Personalized allergen warnings
- User feedback system
- Restaurant menu database

## Tech Stack

- **Frontend & Backend**: Next.js 14+ (App Router)
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **OCR Engine**: Tesseract.js
- **NLP Processing**: compromise.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Prerequisites

- Node.js 18.17.0 or later
- MongoDB Atlas account
- npm or yarn package manager

## Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/safeplate.git
cd safeplate
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
```bash
cp env.example .env.local
```
Edit `.env.local` with your configuration values.

4. Set up MongoDB:
- Create a MongoDB Atlas cluster
- Add your connection string to `.env.local`
- Enable network access for your IP

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/app/api` - Backend API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and services
- `/models` - MongoDB/Mongoose models
- `/public` - Static assets

For detailed architecture information, see [architecture.md](architecture.md).

## Development Workflow

1. Create a feature branch from `main`
2. Implement your changes
3. Write/update tests
4. Create a pull request
5. Wait for review and approval

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## Deployment

The easiest way to deploy SafePlate is using the [Vercel Platform](https://vercel.com/new).

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy

For more details, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
