import { LuHeart } from 'react-icons/lu'
import { useTranslation } from '../i18n/i18n'
import { FaReact } from 'react-icons/fa'
import { Logo } from './Logo'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className={'py-8 border-t border-subtle'}>
      <div className={'container-page flex flex-col md:flex-row items-center justify-between gap-4'}>
        <span className={'meta'}>
          {t('footer.copyright')}
          {' · '}
          {t('footer.builtWith')}
          {' '}
          <LuHeart className={'inline-block align-middle fill-accent text-accent'}/>
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
