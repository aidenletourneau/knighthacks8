"use client";

import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div className={`bg-card text-card-foreground rounded-lg shadow-sm border border-zinc-800 ${className}`} {...props} />
  );
}

export function CardHeader({ className = "", ...props }: CardHeaderProps) {
  return <div className={`p-4 border-b border-zinc-800 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: CardTitleProps) {
  return <h3 className={`text-lg font-semibold ${className}`} {...props} />;
}

export function CardDescription({ className = "", ...props }: CardDescriptionProps) {
  return <p className={`text-sm text-zinc-300 ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }: CardContentProps) {
  return <div className={`p-4 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: CardFooterProps) {
  return <div className={`p-4 border-t border-zinc-800 ${className}`} {...props} />;
}

export default Card;
