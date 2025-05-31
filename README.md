# LXLabs - Hospitality Learning Platform

A React-based learning management system designed for hospitality industry training, featuring bilingual support (English/Khmer) and comprehensive analytics.

## Features

- **Bilingual Interface**: Full support for English and Khmer languages
- **Course Management**: Browse, enroll, and track progress in hospitality courses
- **Analytics Dashboard**: Comprehensive progress tracking with charts and insights
- **Flashcard System**: Interactive vocabulary learning
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile devices

## Recent Bug Fixes

The following TypeScript compilation issues have been resolved:

1. **Missing Icon Imports**: Added `Flame` and `Layers` icons from `lucide-react` to `AnalyticsPage.tsx`
2. **Data Structure Mismatch**: Fixed BarChart component data transformation in `AnalyticsPage.tsx`
3. **Type Mismatch**: Fixed `onSelectCourse` prop type mismatch in `CoursesPage.tsx` by creating a proper handler function

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lxlabs
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npx tsc --noEmit`

Runs TypeScript compilation check without emitting files to verify there are no type errors.

## Project Structure

```
src/
├── components/          # React components
│   ├── AnalyticsPage.tsx    # Progress tracking and analytics
│   ├── CoursesPage.tsx      # Course browsing and enrollment
│   ├── FlashcardSystem.tsx  # Vocabulary learning system
│   └── ...
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles with Tailwind CSS
```

## Technologies Used

- **React 19.1.0** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations
- **Lucide React** - Icon library
- **Radix UI** - Accessible UI components

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
