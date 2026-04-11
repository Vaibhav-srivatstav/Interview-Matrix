// Keyword mapping for tech stack detection
const TECH_KEYWORDS = {
  frontend: ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'next.js', 'redux', 'tailwind', 'bootstrap', 'sass', 'webpack', 'vite', 'typescript'],
  backend: ['node.js', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel', 'fastapi', 'rest api', 'graphql', 'microservices'],
  fullstack: ['full stack', 'fullstack', 'full-stack', 'mern', 'mean', 'lamp'],
  mern: ['mongodb', 'express', 'react', 'node'],
  database: ['mongodb', 'mysql', 'postgresql', 'redis', 'sqlite', 'firebase', 'dynamodb'],
  devops: ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'jenkins', 'github actions'],
  mobile: ['react native', 'flutter', 'ios', 'android', 'kotlin', 'swift'],
  python: ['python', 'django', 'flask', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn'],
  html: ['html', 'html5', 'css', 'css3'],
  javascript: ['javascript', 'es6', 'es2015', 'typescript', 'node.js'],
  react: ['react', 'reactjs', 'react.js', 'hooks', 'redux', 'context api'],
  nodejs: ['node.js', 'nodejs', 'express', 'npm', 'socket.io'],
  mongodb: ['mongodb', 'mongoose', 'nosql', 'atlas'],
  data_structures: ['algorithms', 'data structures', 'leetcode', 'competitive programming'],
  system_design: ['system design', 'scalability', 'load balancer', 'caching', 'microservices'],
};

/**
 * Detect tech stack from resume text
 * @param {string} text - Raw resume text
 * @returns {string[]} - Array of detected tech categories
 */
function detectTechStack(text) {
  const lowerText = text.toLowerCase();
  const detected = new Set();

  for (const [category, keywords] of Object.entries(TECH_KEYWORDS)) {
    const matchCount = keywords.filter((kw) => lowerText.includes(kw)).length;
    // Require at least 2 keyword matches for broader categories
    const threshold = ['mern', 'fullstack', 'system_design'].includes(category) ? 2 : 1;
    if (matchCount >= threshold) {
      detected.add(category);
    }
  }

  // Special logic: if has react + node + mongo → mern
  if (lowerText.includes('react') && lowerText.includes('node') && lowerText.includes('mongo')) {
    detected.add('mern');
    detected.add('fullstack');
  }

  return Array.from(detected);
}

/**
 * Extract structured data from resume text using regex heuristics
 */
function extractResumeData(text) {
  const skills = extractSkills(text);
  const experience = extractExperience(text);
  const education = extractEducation(text);
  const projects = extractProjects(text);
  const summary = extractSummary(text);

  return { skills, experience, education, projects, summary };
}

function extractSkills(text) {
  const allSkills = Object.values(TECH_KEYWORDS).flat();
  const lowerText = text.toLowerCase();
  return [...new Set(allSkills.filter((skill) => lowerText.includes(skill)))];
}

function extractSummary(text) {
  const lines = text.split('\n').filter((l) => l.trim());
  // First 3-5 lines after "summary" or "objective" heading, or just the top
  const summaryIdx = lines.findIndex((l) =>
    /summary|objective|profile|about/i.test(l)
  );
  if (summaryIdx >= 0) {
    return lines
      .slice(summaryIdx + 1, summaryIdx + 4)
      .join(' ')
      .trim();
  }
  return lines.slice(0, 3).join(' ').trim();
}

function extractExperience(text) {
  // Simple heuristic: find blocks with company/role patterns
  const experience = [];
  const expRegex = /(\d{4})\s*[-–]\s*(\d{4}|present|current)/gi;
  const matches = [...text.matchAll(expRegex)];

  matches.forEach((match) => {
    const idx = match.index;
    const block = text.substring(Math.max(0, idx - 200), idx + 200);
    const lines = block.split('\n').filter((l) => l.trim().length > 3);
    if (lines.length >= 2) {
      experience.push({
        company: lines[0]?.trim() || 'Unknown Company',
        role: lines[1]?.trim() || 'Software Developer',
        duration: `${match[1]} - ${match[2]}`,
        description: lines.slice(2, 5).join('. ').trim(),
      });
    }
  });

  return experience.slice(0, 5); // Max 5 experiences
}

function extractEducation(text) {
  const education = [];
  const eduKeywords = ['university', 'college', 'institute', 'b.tech', 'b.e.', 'mca', 'bca', 'm.tech', 'bachelor', 'master', 'phd'];
  const lines = text.split('\n');

  lines.forEach((line, i) => {
    if (eduKeywords.some((kw) => line.toLowerCase().includes(kw))) {
      education.push({
        institution: line.trim(),
        degree: lines[i + 1]?.trim() || '',
        year: (line.match(/\d{4}/) || [])[0] || '',
      });
    }
  });

  return education.slice(0, 3);
}

function extractProjects(text) {
  const projects = [];
  const projectSection = text.match(/projects?([\s\S]*?)(?=experience|education|skills|$)/i);

  if (projectSection) {
    const lines = projectSection[1].split('\n').filter((l) => l.trim().length > 5);
    let current = null;

    lines.forEach((line) => {
      if (line.length < 60 && /[A-Z]/.test(line[0])) {
        if (current) projects.push(current);
        current = { name: line.trim(), tech: [], description: '' };
      } else if (current) {
        const techMatched = extractSkills(line);
        current.tech = [...new Set([...current.tech, ...techMatched])];
        current.description += ' ' + line.trim();
      }
    });

    if (current) projects.push(current);
  }

  return projects.slice(0, 5);
}

export {
  detectTechStack,
  extractResumeData,
};
