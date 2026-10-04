import { LuHeart } from 'react-icons/lu'
import { useTranslation } from '../i18n/i18n'
import { FaReact } from 'react-icons/fa'
import { Logo } from './Logo'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className={'border-t border-subtle py-8'}>
      <div className={'container-page flex flex-col items-center justify-between gap-4 md:flex-row'}>
        <span className={'meta'}>
          {t('footer.copyright')}
          {' · '}
          {t('footer.builtWith')}
          {' '}
          <LuHeart className={'inline-block fill-accent align-middle text-accent'}/>
          {' '}
          {t('footer.and')}
          {' '}
          <FaReact
            className={'inline-block align-middle'}
            color={'#61DAFB'}
          />
        </span>
        <Logo className={'text-xs'}/>
      </div>
    </footer>
  )
}
