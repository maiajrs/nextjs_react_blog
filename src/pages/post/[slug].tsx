import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
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

export default function Post({ post }: PostProps) {
  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <img
          src={post.data.banner.url}
          alt="uma mão segurando um celular com a frase escrita na tela dele, eat, sleep, code and repeat"
        />
      </div>
      <main className={styles.main}>
        <h1>{post.data.title}</h1>
        <div className={styles.info}>
          <span>
            <FiCalendar size={20} />
            {format(new Date(post.first_publication_date), 'PP', {
              locale: ptBR,
            })}
          </span>
          <span>
            <FiUser size={20} />
            Autor
            {post.data.author}
          </span>
        </div>
        <section className={styles.section}>
          {post.data.content.map(content => (
            <div key={content.heading}>
              <h1>{content.heading}</h1>
              {content.body.map(body => (
                <p key={body.text}>{body.text}</p>
              ))}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
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
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', `${slug}`, {
    lang: 'pt-BR',
  });

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body.map(text => ({
          text: text.text,
        })),
      })),
    },
  };
  return { props: { post } };
};
