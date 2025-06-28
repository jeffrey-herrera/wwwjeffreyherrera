import React from 'react';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '../sanity/types';

interface PortableTextComponentProps {
  value: PortableTextBlock[];
}

const components = {
  block: {
    normal: ({ children }: any) => <p className="leading-relaxed text-stone-950 mb-4">{children}</p>,
    h2: ({ children }: any) => <h2 className="text-2xl font-semibold text-stone-950 mb-4 mt-8">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-semibold text-stone-950 mb-3 mt-6">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-orange-500 pl-6 my-6 italic text-stone-700">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-4 space-y-2 mb-4 marker:text-orange-500">
        {children?.map((child: any, index: number) => (
          <li key={index}>
            {child}
          </li>
        ))}
      </ul>
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
  types: {
    spacer: () => (
      <div style={{ height: '1em' }} aria-hidden="true" />
    ),
  },
};

export default function PortableTextComponent({ value }: PortableTextComponentProps) {
  return <PortableText value={value} components={components} />;
} 