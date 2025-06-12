"use client"

import { Instagram, Github, Linkedin } from 'lucide-react';
import type { ReactElement , MouseEvent } from "react";
import { useState, useRef } from 'react';

export default function ContactPage(): ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const offsetX = clientX - centerX;
    const offsetY = clientY - centerY;

    const rotationFactor = 10;

    const newRotateY = (offsetX / (width / 2)) * rotationFactor;
    const newRotateX = (offsetY / (height / 2)) * -rotationFactor;

    setRotateY(newRotateY);
    setRotateX(newRotateX);
  };


  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div
        ref={cardRef}
        className="card w-full max-w-2xl space-y-8 p-8 shadow-lg rounded-3xl
                   transition-all duration-300 ease-out will-change-transform
                   hover:shadow-xl hover:scale-[1.02] transform-gpu"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <h1 className="text-center text-4xl font-bold text-primary">
          Get in Touch
        </h1>

        <p className="text-center text-lg text-foreground">
          I'm a developer passionate about creating efficient and user-friendly applications.
          Feel free to reach out for collaborations, questions, or just to say hello!
        </p>

        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <a
            href="https://www.instagram.com/bynarig/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md bg-accent px-6 py-3 text-accent-foreground shadow-md transition-colors hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Instagram className="h-6 w-6" />
            <span className="text-lg font-medium">Instagram</span>
          </a>

          <a
            href="https://github.com/bynarig"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md bg-secondary px-6 py-3 text-secondary-foreground shadow-md transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Github className="h-6 w-6" />
            <span className="text-lg font-medium">GitHub</span>
          </a>

          <a
            href="https://www.linkedin.com/in/yaroslav-shabelnyk/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md bg-primary px-6 py-3 text-primary-foreground shadow-md transition-colors hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Linkedin className="h-6 w-6" />
            <span className="text-lg font-medium">LinkedIn</span>
          </a>
        </div>

        <p className="text-center text-muted-foreground text-sm">
          Looking forward to connecting with you!
        </p>
      </div>
    </div>
  );
}