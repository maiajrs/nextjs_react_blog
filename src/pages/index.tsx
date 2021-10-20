import { GetStaticProps } from 'next';
import { useState } from 'react';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
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

export default function Home({ postsPagination }: HomeProps) {
  const [results, setResults] = useState(postsPagination.results);
  const [next_page, setNext_page] = useState(postsPagination.next_page);
  async function loadMorePosts() {
    if (next_page) {
      const response = await fetch(next_page);
      const json = await response.json();

      setResults([...results, ...json.results]);
      setNext_page(json.next_page);
    }
  }
  return (
    <main className={styles.container}>
      {results?.map(post => (
        <section key={post.uid} className={styles.content}>
          <Link href={`/post/${post.uid}`}>
            <a>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
            </a>
          </Link>
          <div className={styles.info}>
            <span>
              <FiCalendar size={20} />{' '}
              {format(new Date(post.first_publication_date), 'PP', {
                locale: ptBR,
              })}
            </span>
            <span>
              <FiUser size={20} /> {post.data.author}
            </span>
          </div>
        </section>
      ))}
      {next_page ? (
        <button
          className={commonStyles.button}
          type="button"
          onClick={loadMorePosts}
        >
          Carregar mais posts
        </button>
      ) : (
        ''
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.last_publication_date desc]',
    }
  );
  const results = postsResponse.results.map(post => {
    console.log(JSON.stringify(post, null, 2))
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  return {
    props: { postsPagination: { results, next_page: postsResponse.next_page } },
  };
};
