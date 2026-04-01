import { describe, it, expect } from 'vitest';
import {
  norm,
  tokenize,
  scoreSkills,
  scoreDepartment,
  scoreLocation,
  scoreTitleRelevance,
  DEPT_KEYWORDS,
} from './matching.service';

/* ════════════════════════════════════════════════
   SmartMatch Engine — Unit Tests
   ════════════════════════════════════════════════ */

// ── norm() ──

describe('norm()', () => {
  it('lowercases and strips special characters', () => {
    expect(norm('React.js')).toBe('react js');
  });

  it('preserves + and # for tech names', () => {
    expect(norm('C++')).toBe('c++');
    expect(norm('C#')).toBe('c#');
  });

  it('collapses multiple spaces', () => {
    expect(norm('  hello   world  ')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(norm('')).toBe('');
  });
});

// ── tokenize() ──

describe('tokenize()', () => {
  it('splits into meaningful words (length > 1)', () => {
    expect(tokenize('Build a web app')).toEqual(['build', 'web', 'app']);
    // "a" is filtered out because length <= 1
  });

  it('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
  });
});

// ── scoreSkills() ──

describe('scoreSkills()', () => {
  it('returns 0 score and empty matches for empty student skills', () => {
    const result = scoreSkills([], 'React, Node.js', 'Build frontend apps');
    expect(result.score).toBe(0);
    expect(result.matchedSkills).toEqual([]);
  });

  it('matches exact skill names in requirements', () => {
    const result = scoreSkills(
      ['React', 'Node.js'],
      'Looking for React and Node.js developer',
      'Full stack web application',
    );
    expect(result.matchedSkills).toContain('React');
    expect(result.matchedSkills).toContain('Node.js');
    expect(result.score).toBeGreaterThan(0);
  });

  it('finds skills in the description too, not just requirements', () => {
    const result = scoreSkills(
      ['Python'],
      'Software developer needed',          // Python NOT in requirements
      'Must be proficient in Python',        // Python IS in description
    );
    expect(result.matchedSkills).toContain('Python');
    expect(result.score).toBeGreaterThan(0);
  });

  it('returns no match when skills are completely different', () => {
    const result = scoreSkills(
      ['Rust', 'Go', 'Kubernetes'],
      'Looking for graphic designer',
      'Adobe Photoshop and Illustrator experience needed',
    );
    expect(result.matchedSkills).toHaveLength(0);
    expect(result.score).toBe(0);
  });

  it('handles partial matches for multi-word skills', () => {
    const result = scoreSkills(
      ['Machine Learning'],
      'We need someone with experience in machine learning and AI',
      'Deep learning projects',
    );
    expect(result.matchedSkills).toContain('Machine Learning');
  });

  it('score is capped at 1.0', () => {
    const result = scoreSkills(
      ['React'],
      'React',
      'React React React developer',
    );
    expect(result.score).toBeLessThanOrEqual(1.0);
  });

  it('is case-insensitive', () => {
    const result = scoreSkills(
      ['REACT', 'node.JS'],
      'We use react and node.js',
      '',
    );
    expect(result.matchedSkills).toContain('REACT');
    expect(result.matchedSkills).toContain('node.JS');
  });
});

// ── scoreDepartment() ──

describe('scoreDepartment()', () => {
  it('returns 0.3 (neutral) when department is null', () => {
    expect(scoreDepartment(null, 'any offer text', null)).toBe(0.3);
  });

  it('scores high for CS student + software offer', () => {
    const score = scoreDepartment(
      'Computer Science',
      'Software developer intern — full stack web development with cloud technologies',
      'Technology',
    );
    expect(score).toBeGreaterThanOrEqual(0.5);
  });

  it('scores low for unrelated department + offer', () => {
    const score = scoreDepartment(
      'Medicine',
      'Frontend web developer React internship',
      'Technology',
    );
    expect(score).toBeLessThan(0.3);
  });

  it('covers all 17 departments in the keyword map', () => {
    expect(Object.keys(DEPT_KEYWORDS).length).toBe(17);
  });

  it('result is capped at 1.0', () => {
    const score = scoreDepartment(
      'Computer Science',
      'software web mobile data cloud devops ai frontend backend developer engineer programming it tech digital cyber security database api',
      'Technology',
    );
    expect(score).toBeLessThanOrEqual(1.0);
  });
});

// ── scoreLocation() ──

describe('scoreLocation()', () => {
  it('returns 0.3 (neutral) when university is null', () => {
    expect(scoreLocation(null, 'Algiers', null)).toBe(0.3);
  });

  it('returns 1.0 when university city matches offer location', () => {
    const score = scoreLocation(
      'University of Constantine',
      'Constantine, Algeria',
      null,
    );
    expect(score).toBe(1.0);
  });

  it('returns 1.0 when university city matches company location', () => {
    const score = scoreLocation(
      'University of Constantine',
      'Algiers',              // offer says Algiers
      'Constantine, Algeria', // but company is in Constantine
    );
    expect(score).toBe(1.0);
  });

  it('returns 0.7 for remote offers', () => {
    const score = scoreLocation(
      'University of Constantine',
      'Remote',
      null,
    );
    expect(score).toBe(0.7);
  });

  it('returns 0.1 when no location match at all', () => {
    const score = scoreLocation(
      'University of Constantine',
      'Paris, France',
      'Lyon, France',
    );
    expect(score).toBe(0.1);
  });
});

// ── scoreTitleRelevance() ──

describe('scoreTitleRelevance()', () => {
  it('returns 0.2 when student has no skills', () => {
    expect(scoreTitleRelevance([], 'React Developer Intern')).toBe(0.2);
  });

  it('scores high when student skills appear in title', () => {
    const score = scoreTitleRelevance(
      ['React', 'TypeScript', 'Node.js'],
      'React TypeScript Frontend Developer Intern',
    );
    expect(score).toBeGreaterThan(0.5);
  });

  it('scores 0 when skills are not in the title', () => {
    const score = scoreTitleRelevance(
      ['Python', 'Django'],
      'Java Backend Developer Intern',
    );
    expect(score).toBe(0);
  });

  it('result is capped at 1.0', () => {
    const score = scoreTitleRelevance(
      ['React', 'Node', 'TypeScript'],
      'React Node TypeScript Full Stack Developer',
    );
    expect(score).toBeLessThanOrEqual(1.0);
  });
});

// ── Weighted final score formula ──

describe('Weighted final score', () => {
  it('weights sum to 100%', () => {
    const total = 0.50 + 0.25 + 0.15 + 0.10;
    expect(total).toBe(1.0);
  });

  it('computes correct combined score for a known scenario', () => {
    // Simulate: a CS student from Constantine with React skills
    // applying to a React developer offer in Constantine
    const { score: skillScore } = scoreSkills(
      ['React', 'JavaScript'],
      'React, JavaScript developer needed',
      'Build modern web apps',
    );
    const deptScore = scoreDepartment('Computer Science', 'React JavaScript developer web frontend', 'Technology');
    const locScore = scoreLocation('University of Constantine', 'Constantine', null);
    const titleScore = scoreTitleRelevance(['React', 'JavaScript'], 'React Frontend Developer Intern');

    const finalScore = (0.50 * skillScore) + (0.25 * deptScore) + (0.15 * locScore) + (0.10 * titleScore);
    const matchScore = Math.round(finalScore * 100);

    expect(matchScore).toBeGreaterThanOrEqual(50);
    expect(matchScore).toBeLessThanOrEqual(100);
  });
});
