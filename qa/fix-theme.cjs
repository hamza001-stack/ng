const fs=require('fs');const p='src/components/header.tsx';let s=fs.readFileSync(p,'utf8');
s=s.replace("import Image from 'next/image';\n",'');
s=s.replace('  UserRound,\n} from', '  UserRound,\n  Moon,\n  Sun,\n} from');
s=s.replace('  const [mobile, setMobile] = useState(false);\n', "  const [mobile, setMobile] = useState(false);\n  const [theme, setTheme] = useState<'light' | 'dark'>('light');\n");
fs.writeFileSync(p,s);
