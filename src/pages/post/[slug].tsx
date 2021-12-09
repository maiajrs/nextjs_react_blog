import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { useMemo } from 'react';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
  data: {
    subtitle: string;
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
  preview: boolean;
  post: Post;
  nextPost: Post | null;
  prevPost: Post | null;
}

export default function Post({ post, preview, nextPost, prevPost }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isEditedPost = useMemo(() => {
    if (router.isFallback) {
      return false;
    }

    return post.last_publication_date !== post.first_publication_date;
  }, [post, router.isFallback]);

  function timeReading(content) {
    const total = content?.reduce((acc, next) => {
      next.body.forEach(ArrayExteno => {
        // eslint-disable-next-line no-param-reassign
        acc += ArrayExteno.text.split(/[ ]/).length;
      });

      return acc;
    }, 0);

    return Math.ceil(total / 200);
  }

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
            {post.data.author}
          </span>
          <span>
            <FiClock size={20} />
            {timeReading(post.data.content)} min
          </span>
        </div>
        {isEditedPost && (
          <div className={styles.postEdited}>
            <span>
              * editado em{' '}
              <time>
                {format(new Date(post.last_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              , às{' '}
              <time>
                {format(
                  new Date(post.last_publication_date),
                  `${'HH'}:${'mm'}`,
                  {
                    locale: ptBR,
                  }
                )}
              </time>
            </span>
          </div>
        )}
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
        <footer className={styles.navigationController}>
          <div>
            {prevPost && (
              <Link href={`/post/${prevPost.uid}`}>
                <a>
                  <h4>{prevPost.data.title}</h4>
                  <span>Post anterior</span>
                </a>
              </Link>
            )}
          </div>
          <div>
            {nextPost && (
              <Link href={`/post/${nextPost.uid}`}>
                <a>
                  <h4>{nextPost.data.title}</h4>
                  <span>Próximo post</span>
                </a>
              </Link>
            )}
          </div>
        </footer>
        <Comments />
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
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
  return { paths: slugs, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', `${slug}`, {
    lang: 'pt-BR',
    ref: previewData?.ref ?? null,
  });

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date]',
      after: response.id,
    }
  );

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date desc]',
      after: response.id,
    }
  );

  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body.map(spans => spans),
      })),
    },
  };

  return {
    props: {
      post,
      preview,
      nextPost: nextPost.results[0] ?? null,
      prevPost: prevPost.results[0] ?? null,
    },
  };
};
