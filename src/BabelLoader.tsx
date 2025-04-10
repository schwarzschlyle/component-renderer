import React, { useEffect, useState } from 'react';

interface BabelLoaderProps {
  children: (isLoaded: boolean) => React.ReactNode;
}

const BabelLoader: React.FC<BabelLoaderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!(window as any).Babel || !(window as any).React || !(window as any).ReactDOM) {
      const babelScript = document.createElement('script');
      babelScript.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
      babelScript.async = true;
      babelScript.onload = () => {
        const reactScript = document.createElement('script');
        reactScript.src = 'https://unpkg.com/react@18/umd/react.development.js';
        reactScript.async = true;
        reactScript.onload = () => {
          const reactDOMScript = document.createElement('script');
          reactDOMScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
          reactDOMScript.async = true;
          reactDOMScript.onload = () => {
            setIsLoaded(true);
          };
          document.body.appendChild(reactDOMScript);
        };
        document.body.appendChild(reactScript);
      };
      document.body.appendChild(babelScript);
    } else {
      setIsLoaded(true);
    }
  }, []);

  return <>{children(isLoaded)}</>;
};

export default BabelLoader;
