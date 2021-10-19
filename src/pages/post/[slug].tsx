import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post() {
  return <h1>Page Post in construction</h1>;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 100,
      orderings: '[document.last_publication_date desc]',
    }
  );
  const slugs = posts.results.map(post => ({
    params: { slug: post.uid },
  }));
  return { paths: slugs, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  console.log(params);
  const prismic = getPrismicClient();

  // const response = await prismic.getByUID(TODO);

  return { props: {} };
};
