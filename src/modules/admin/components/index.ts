import { ComponentLoader } from 'adminjs'

const componentLoader = new ComponentLoader()

const Components = {
  Scanlink: componentLoader.add('Scanlink', './scanlink'),
  Decimal: componentLoader.add('Decimal', './decimal'),
  Dashboard: componentLoader.add('Dashboard', './dashboard')
}

export { componentLoader, Components }
