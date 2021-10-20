import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.container}>
      <div className={styles.logo}>
        <Link href="/">
          <a>
            <Image
              src="/images/logoBlog.svg"
              alt="logo"
              width="238.62px"
              height="25.63px"
            />
          </a>
        </Link>
      </div>
    </header>
  );
}
