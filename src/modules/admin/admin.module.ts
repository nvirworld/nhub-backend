import { APP } from '@/app.config'
import { ConfigService } from '@/common/config'
import { NODE_ENV } from '@/common/env'
import { LoggerService } from '@/common/logger'
import { AuthModule } from '@/modules/admin/auth/auth.module'
import { AuthService } from '@/modules/admin/auth/auth.service'
import { componentLoader, Components } from '@/modules/admin/components'
import { ResourceModule } from '@/modules/admin/resources/resource.module'
import { ResourceService } from '@/modules/admin/resources/resource.service'
import { AdminModule as AdminJSModule } from '@adminjs/nestjs'
import { AdminModuleOptions } from '@adminjs/nestjs/src/interfaces/admin-module-options.interface'
import { Database, Resource } from '@adminjs/typeorm'
import { Module } from '@nestjs/common'
import AdminJS from 'adminjs'

AdminJS.registerAdapter({ Database, Resource })

@Module({
  imports: [
    AdminJSModule.createAdminAsync({
      imports: [AuthModule, ResourceModule],
      inject: [AuthService, LoggerService, ResourceService, ConfigService],
      useFactory: async (
        authService: AuthService,
        loggerService: LoggerService,
        resourceService: ResourceService,
        configService: ConfigService
      ): Promise<AdminModuleOptions> => {
        const adminModuleOptions: AdminModuleOptions = {
          adminJsOptions: {
            branding: {
              companyName: `NHUB`,
              logo: false,
              withMadeWithLove: false,
              favicon: '/static/favicon.ico'
            },
            dashboard: {
              component: Components.Dashboard
            },
            assets: {
              styles: ['/static/custom.css'],
              scripts: ['/static/custom.js']
            },
            rootPath: '/ctrl',
            loginPath: '/ctrl/login',
            logoutPath: '/ctrl/logout',
            resources: await resourceService.getResources(),
            componentLoader
          }
        }
        if (APP.ENV.nodeEnv !== NODE_ENV.local) {
          adminModuleOptions.auth = {
            authenticate: async (email: string, password: string) => {
              try {
                return await authService.signIn(email, password)
              } catch (err) {
                loggerService.warn(err.message, { err })
                return null
              }
            },
            cookiePassword: await configService.get('cookiePassword'),
            cookieName: await configService.get('cookieName')
          }
          adminModuleOptions.sessionOptions = {
            resave: true,
            saveUninitialized: true,
            secret: 'secret'
          }
        }
        return adminModuleOptions
      }
    })
  ]
})
export class AdminModule {}
