# SmartNotebook

A modern document analysis and content generation tool.

## Getting Started

1. Create a `.env.local` file in the root directory with the following content:
```env
NEXT_PUBLIC_API_URL=https://api.autocontentapi.com
NEXT_PUBLIC_API_KEY=your_api_key_here
```

2. Get your API key:
   - Sign up at [AutoContent API](https://autocontentapi.com)
   - Create a new project
   - Copy your API key
   - Replace `your_api_key_here` in `.env.local` with your actual API key

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

## Features

- Document analysis and content generation
- Multiple output formats (Study Guide, FAQ, Timeline, etc.)
- Deep Dive conversations
- Source management
- Real-time chat interface

## Development

The application uses:
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

## Environment Variables

- `NEXT_PUBLIC_API_URL`: The API endpoint (default: https://api.autocontentapi.com)
- `NEXT_PUBLIC_API_KEY`: Your API key from AutoContent API
- `NODE_ENV`: Development environment setting