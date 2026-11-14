import fs from 'node:fs';
let h=fs.readFileSync('src/components/header.tsx','utf8');h=h.replace("import Image from 'next/image';\n'use client';","'use client';\nimport Image from 'next/image';");fs.writeFileSync('src/components/header.tsx',h);
let s=fs.readFileSync('src/features/shop.tsx','utf8');s=s.replace('useEffect(() => { if (track) viewed(id); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id, track]);','useEffect(() => { if (track) viewed(id); }, [id, track, viewed]);');fs.writeFileSync('src/features/shop.tsx',s);
