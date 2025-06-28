import React from 'react';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '../sanity/types';

interface PortableTextComponentProps {
  value: PortableTextBlock[];
}

const components = {
  block: {
    normal: ({ children }: any) => <p className="text-lg leading-relaxed text-stone-700 mb-4">{children}</p>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold text-stone-900 mb-4 mt-8">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-semibold text-stone-900 mb-3 mt-6">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-orange-500 pl-6 my-6 italic text-stone-700">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-stone-100 text-stone-800 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        target={value.blank ? '_blank' : '_self'}
        rel={value.blank ? 'noopener noreferrer' : undefined}
        className="text-orange-600 hover:text-orange-700 underline transition-colors"
      >
        {children}
      </a>
    ),
  },
};

export default function PortableTextComponent({ value }: PortableTextComponentProps) {
  return <PortableText value={value} components={components} />;
} 