import Image from "next/image";

const IMAGE_VERSION = "ink-blue-3";
const IMAGE_BASE = "/images/variants/ink-blue";

function imageSrc(path: string) {
  const file = path.replace(/^\/images\//, "");
  return `${IMAGE_BASE}/${file}?v=${IMAGE_VERSION}`;
}

export function SubpageNav() {
  return (
    <nav className="nav nav--subpage" aria-label="Main navigation">
      <a href="/" aria-label="Heldi home" className="nav-home">
        <Image
          className="heldi-logo heldi-logo--on-dark"
          src={imageSrc("/images/heldi-wordmark.png")}
          alt="Heldi"
          width={1934}
          height={609}
          sizes="140px"
        />
        <span className="nav-elephant-badge">
          <Image
            className="nav-elephant-logo"
            src={imageSrc("/images/elephant-large-transparent.png")}
            alt="Heldi"
            width={2048}
            height={2048}
          />
        </span>
      </a>
      <div className="nav-links nav-links--subpage">
        <a href="/#how">How it works</a>
        <a href="/truth">The truth</a>
        <a href="/our-story">Our story</a>
      </div>
    </nav>
  );
}

export function SubpageFooter() {
  return (
    <footer>
      <Image
        className="heldi-logo heldi-logo--footer heldi-logo--on-dark"
        src={imageSrc("/images/heldi-wordmark.png")}
        alt="Heldi"
        width={1934}
        height={609}
        sizes="120px"
      />
      <span>© 2026 Heldi · Made in the UK · They shake, we stir</span>
    </footer>
  );
}
