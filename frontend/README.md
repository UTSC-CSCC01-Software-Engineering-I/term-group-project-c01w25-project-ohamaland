# CSCC01 Project Frontend

### Getting Started

#### Installation

1. Ensure you've downloaded [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
2. Run `npm install` in the root to pull all the projects dependencies.

#### Usage
- `npm run dev`: Run the project in dev mode.
- `npm run format`: Lint ([ESLint](https://eslint.org/)) and format ([Prettier](https://prettier.io/))

## Coding Conventions
This section will cover the frontend coding conventions

### 1. File Naming
- `PascalCase.tsx`: React components should be capitalized.
- `camelCase.ts`: Other files should be camel case.
- `/kabob-case`: Folders should be separated with dashes.

### 2. Creating Components
React Components should follow this template.

```tsx
interface ComponentNameProps {
  firstParam: string;
  children: React.ReactNode;
}

export default function ComponentName({
  firstParam,
  children
}: ComponentNameProps) {
  // ...
}
```
