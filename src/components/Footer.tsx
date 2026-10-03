import { LuHeart } from 'react-icons/lu'
import { useTranslation } from '../i18n/i18n'
import { FaReact } from 'react-icons/fa'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className={'py-8 border-t border-subtle'}>
      <div className={'max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4'}>
        <span className={'font-mono text-xs text-muted'}>
          {t('footer.copyright')}
          {' · '}
          {t('footer.builtWith')}
          {' '}
          <LuHeart
            className={'inline-block align-middle'}
            fill={'#FF0000'}
            color={'#FF0000'}
          />
          {' '}
          {t('footer.and')}
          {' '}
          <FaReact
            className={'inline-block align-middle'}
            color={'#61DAFB'}
          />
        </span>
        {/* eslint-disable-next-line @eslint-react/jsx-no-comment-textnodes */}
        <span className={'font-mono text-xs text-accent'}>//RMCKR</span>
      </div>
    </footer>
  )
}
