import { DynamicModule, Provider, SetMetadata } from '@nestjs/common'
import { getDataSourceToken } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'

export const TYPEORM_CUSTOM_REPOSITORY = 'TYPEORM_CUSTOM_REPOSITORY'

export function CustomRepository(entity: Function): ClassDecorator {
  return SetMetadata(TYPEORM_CUSTOM_REPOSITORY, entity)
}

export class CustomTypeOrmModule {
  public static forCustomRepository<T extends new (...args: any[]) => any>(
    repositories: T[],
    dataSource?: DataSource | DataSourceOptions | string
  ): DynamicModule {
    const providers: Provider[] = []

    for (const Repository of repositories) {
      const entity = Reflect.getMetadata(TYPEORM_CUSTOM_REPOSITORY, Repository)

      if (entity == null) {
        continue
      }

      providers.push({
        inject: [getDataSourceToken(dataSource)],
        provide: Repository,
        useFactory: (dataSource: DataSource): typeof Repository => {
          const baseRepository = dataSource.getRepository<any>(entity)
          const customRepository = new Repository(
            baseRepository.target,
            baseRepository.manager,
            baseRepository.queryRunner
          )

          Object.defineProperty(customRepository, 'manager', {
            get() {
              return baseRepository.manager
            }
          })

          return customRepository
        }
      })
    }

    return { exports: providers, module: CustomTypeOrmModule, providers }
  }
}
