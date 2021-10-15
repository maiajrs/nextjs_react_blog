import Image from 'next/image';
import styles from './header.module.scss';
import svgLogo from '../../../public/images/logo-blog.svg';

export default function Header() {
  return (
    <header className={styles.container}>
      <div className={styles.logo}>
        <Image
          src={svgLogo}
          alt="spacetraveling blog"
          width="238.62px"
          height="25.63px"
        />
      </div>
    </header>
  );
}
