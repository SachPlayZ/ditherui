import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { mono } from '@/lib/fonts';
import { SiteStyle, StyleBar } from '@/components/site/site-style';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <SiteStyle font={mono.style.fontFamily}>
      <DocsLayout tree={source.getPageTree()} {...baseOptions()} sidebar={{ banner: <StyleBar /> }}>
        {children}
      </DocsLayout>
    </SiteStyle>
  );
}
