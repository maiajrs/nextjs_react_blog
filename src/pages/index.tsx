import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <h1>Como utilizar Hooks</h1>
        <p>Pensando em sincronização em vez de clicos de vida</p>
        <div className={styles.info}>
          <span>
            <FiCalendar /> 15 Mar 2021
          </span>
          <span>
            <FiUser /> Júnior Maia
          </span>
        </div>
      </section>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 10,
    }
  );
  console.log(JSON.stringify(postsResponse, null, 2));
  return {
    props: { postPagination: postsResponse },
  };
};
