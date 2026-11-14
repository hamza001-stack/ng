/* eslint-disable @next/next/no-img-element */

const safeSrc = (src: string) => (/^(\/|https:\/\/)/.test(src) ? src : '');

export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split('\n');
        if (lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={index}>
              {lines.map((line) => (
                <li key={line}>{line.replace(/^[-*]\s+/, '')}</li>
              ))}
            </ul>
          );
        }
        const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (image && safeSrc(image[2])) {
          return (
            <figure key={index}>
              <img src={safeSrc(image[2])} alt={image[1]} loading="lazy" />
              {image[1] ? <figcaption>{image[1]}</figcaption> : null}
            </figure>
          );
        }
        if (/^###\s+/.test(block)) {
          return <h3 key={index}>{block.replace(/^###\s+/, '')}</h3>;
        }
        return <p key={index}>{block}</p>;
      })}
    </>
  );
}
