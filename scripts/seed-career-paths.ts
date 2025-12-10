import connectDB from '@/lib/db'
import CareerPath from '@/models/CareerPath'
import Module from '@/models/Module'

const frontendPath = {
  title: 'Frontend Developer',
  slug: 'frontend-developer',
  description: 'Master modern frontend development with HTML, CSS, JavaScript, and React. Build responsive websites and interactive web applications.',
  difficulty: 'Beginner',
  estimatedHours: 40,
  icon: '🎨',
  color: 'bg-blue-500',
  tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Web Development'],
  learningOutcomes: [
    'Build responsive websites from scratch',
    'Create interactive web applications',
    'Master modern JavaScript and React',
    'Understand web accessibility and performance',
    'Deploy applications to production'
  ],
  targetAudience: [
    'Complete beginners to web development',
    'Developers switching to frontend',
    'Students learning web technologies'
  ],
  skillAssessment: {
    questions: [
      {
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlink and Text Markup Language'
        ],
        correctAnswer: 0,
        skillArea: 'HTML',
        weight: 1
      },
      {
        question: 'Which CSS property is used to change the text color?',
        options: ['font-color', 'text-color', 'color', 'foreground-color'],
        correctAnswer: 2,
        skillArea: 'CSS',
        weight: 1
      },
      {
        question: 'How do you declare a variable in JavaScript?',
        options: ['var myVar;', 'variable myVar;', 'v myVar;', 'declare myVar;'],
        correctAnswer: 0,
        skillArea: 'JavaScript',
        weight: 1
      },
      {
        question: 'What is React?',
        options: [
          'A database',
          'A JavaScript library for building user interfaces',
          'A CSS framework',
          'A web server'
        ],
        correctAnswer: 1,
        skillArea: 'React',
        weight: 1
      }
    ],
    passingScore: 70,
    skillAreas: ['HTML', 'CSS', 'JavaScript', 'React']
  }
}

const modules = [
  {
    title: 'HTML Basics',
    slug: 'html-basics',
    description: 'Learn the fundamental building blocks of web pages with HTML',
    content: `# HTML Basics

HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using markup.

## What is HTML?

HTML consists of a series of elements that tell the browser how to display content. Elements are represented by tags.

## Basic HTML Structure

Every HTML document has a basic structure:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
</head>
<body>
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>
</body>
</html>
\`\`\`

## Common HTML Elements

- **Headings**: \`<h1>\` to \`<h6>\`
- **Paragraphs**: \`<p>\`
- **Links**: \`<a href="url">Link text</a>\`
- **Images**: \`<Image src="image.jpg" alt="" width={500} height={300}  alt="Description" />\`
- **Lists**: \`<ul>\`, \`<ol>\`, \`<li>\`

## Semantic HTML

Use semantic elements to give meaning to your content:

- \`<header>\` - Page or section header
- \`<nav>\` - Navigation links
- \`<main>\` - Main content
- \`<article>\` - Independent content
- \`<section>\` - Thematic grouping
- \`<footer>\` - Page or section footer

## Try It Yourself

Create a simple HTML page with a heading, paragraph, and link.`,
    order: 1,
    estimatedMinutes: 120,
    xpReward: 50,
    difficulty: 'beginner',
    canSkip: true,
    skillsLearned: ['HTML Structure', 'HTML Elements', 'Document Structure', 'Semantic HTML'],
    codeExamples: [
      {
        language: 'html',
        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <header>
        <h1>Welcome to HTML</h1>
    </header>
    <main>
        <p>This is my first HTML page!</p>
        <a href="https://developer.mozilla.org">Learn more about HTML</a>
    </main>
</body>
</html>`,
        description: 'A complete HTML document with semantic structure',
        isInteractive: true,
        expectedOutput: 'A webpage with a header, main content, and a link'
      }
    ],
    externalResources: [
      {
        title: 'MDN HTML Basics',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics',
        type: 'documentation',
        description: 'Comprehensive guide to HTML basics from Mozilla Developer Network',
        difficulty: 'beginner'
      },
      {
        title: 'HTML Tutorial - W3Schools',
        url: 'https://www.w3schools.com/html/',
        type: 'tutorial',
        description: 'Interactive HTML tutorial with examples',
        difficulty: 'beginner'
      },
      {
        title: 'HTML Crash Course',
        url: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
        type: 'video',
        description: '1-hour HTML crash course for beginners',
        difficulty: 'beginner'
      },
      {
        title: 'HTML Validator',
        url: 'https://validator.w3.org/',
        type: 'tool',
        description: 'Validate your HTML code for errors',
        difficulty: 'beginner'
      }
    ],
    practiceExercises: [
      {
        title: 'Create Your First Webpage',
        description: 'Build a simple personal webpage using basic HTML elements',
        instructions: [
          'Create an HTML document with proper structure',
          'Add a heading with your name',
          'Write a paragraph about yourself',
          'Add a link to your favorite website',
          'Include an image (you can use a placeholder)'
        ],
        starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <!-- Add your content here -->
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Personal Page</title>
</head>
<body>
    <header>
        <h1>John Doe</h1>
    </header>
    <main>
        <p>I'm a web developer learning HTML! I love creating websites and learning new technologies.</p>
        <a href="https://github.com">Visit my GitHub</a>
        <Image src="https://via.placeholder.com/300x200" alt="" width={500} height={300}  alt="Placeholder image" />
    </main>
</body>
</html>`,
        hints: [
          'Remember to use semantic HTML elements like <header> and <main>',
          'Don\'t forget the alt attribute for images',
          'Use proper indentation for readability',
          'Include meta tags for better SEO'
        ],
        difficulty: 'easy'
      }
    ],
    prerequisites: [
      {
        skill: 'Basic computer literacy',
        level: 'basic',
        optional: false
      }
    ]
  },
  {
    title: 'CSS Fundamentals',
    slug: 'css-fundamentals',
    description: 'Style your web pages with CSS and create beautiful, responsive designs',
    content: `# CSS Fundamentals

CSS (Cascading Style Sheets) is used to style and layout web pages. It controls the visual presentation of HTML elements.

## What is CSS?

CSS describes how HTML elements should be displayed. It can control layout, colors, fonts, spacing, and much more.

## CSS Syntax

CSS rules consist of a selector and a declaration block:

\`\`\`css
selector {
    property: value;
    property: value;
}
\`\`\`

## Adding CSS to HTML

There are three ways to add CSS:

1. **Inline CSS**: Using the \`style\` attribute
2. **Internal CSS**: Using \`<style>\` tags in the \`<head>\`
3. **External CSS**: Linking to a separate CSS file

## CSS Selectors

- **Element selector**: \`p { }\`
- **Class selector**: \`.my-class { }\`
- **ID selector**: \`#my-id { }\`
- **Descendant selector**: \`div p { }\`

## The Box Model

Every HTML element is a rectangular box with:
- **Content**: The actual content
- **Padding**: Space around content
- **Border**: Line around padding
- **Margin**: Space outside border

## Responsive Design

Use media queries to create responsive designs:

\`\`\`css
@media (max-width: 768px) {
    .container {
        width: 100%;
    }
}
\`\`\``,
    order: 2,
    estimatedMinutes: 180,
    xpReward: 75,
    difficulty: 'beginner',
    canSkip: true,
    skillsLearned: ['CSS Syntax', 'Selectors', 'Box Model', 'Responsive Design', 'Flexbox'],
    codeExamples: [
      {
        language: 'css',
        code: `/* Basic CSS styling */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
    color: #333;
    text-align: center;
    margin-bottom: 30px;
}

.button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.button:hover {
    background-color: #0056b3;
}`,
        description: 'Complete CSS styling for a modern webpage',
        isInteractive: true,
        expectedOutput: 'A styled webpage with modern design elements'
      }
    ],
    externalResources: [
      {
        title: 'MDN CSS Basics',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics',
        type: 'documentation',
        description: 'Complete guide to CSS fundamentals',
        difficulty: 'beginner'
      },
      {
        title: 'CSS-Tricks',
        url: 'https://css-tricks.com/',
        type: 'reference',
        description: 'Comprehensive CSS reference and tutorials',
        difficulty: 'intermediate'
      },
      {
        title: 'Flexbox Froggy',
        url: 'https://flexboxfroggy.com/',
        type: 'tutorial',
        description: 'Learn CSS Flexbox through a fun game',
        difficulty: 'beginner'
      }
    ],
    practiceExercises: [
      {
        title: 'Style a Card Component',
        description: 'Create a modern card design using CSS',
        instructions: [
          'Style the card with a white background and shadow',
          'Add padding and border-radius',
          'Style the heading and text',
          'Add a hover effect',
          'Make it responsive'
        ],
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        /* Add your CSS here */
    </style>
</head>
<body>
    <div class="card">
        <h2>Card Title</h2>
        <p>This is some card content that needs styling.</p>
        <button class="btn">Learn More</button>
    </div>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f0f0f0;
            padding: 20px;
        }
        
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 300px;
            margin: 0 auto;
            transition: transform 0.3s;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="card">
        <h2>Card Title</h2>
        <p>This is some card content that needs styling.</p>
        <button class="btn">Learn More</button>
    </div>
</body>
</html>`,
        hints: [
          'Use box-shadow for the card shadow effect',
          'Border-radius makes rounded corners',
          'Transitions create smooth hover effects',
          'Max-width helps with responsive design'
        ],
        difficulty: 'medium'
      }
    ],
    prerequisites: [
      {
        skill: 'HTML Basics',
        level: 'basic',
        optional: false
      }
    ]
  }
]

export async function seedCareerPaths() {
  try {
    await connectDB()
    
    // Clear existing data
    await CareerPath.deleteMany({})
    await Module.deleteMany({})
    
    // Create career path
    const createdPath = await CareerPath.create(frontendPath)
    console.log('Created career path:', createdPath.title)
    
    // Create modules
    for (const moduleData of modules) {
      const module = await Module.create({
        ...moduleData,
        pathId: createdPath._id
      })
      
      // Add module to path
      createdPath.modules.push(module._id)
      console.log('Created module:', module.title)
    }
    
    await createdPath.save()
    console.log('Career path seeding completed successfully!')
    
  } catch (error: unknown) {
    console.error('Error seeding career paths:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedCareerPaths().then(() => process.exit(0))
}