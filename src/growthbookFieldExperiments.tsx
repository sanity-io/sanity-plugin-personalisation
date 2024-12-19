import {definePlugin, FieldDefinition, isObjectInputProps} from 'sanity'

import {Secrets} from './components/Secrets'
import {fieldLevelExperiments} from './fieldExperiments'
import {flattenSchemaType} from './utils/flattenSchemaType'
import {getExperiments} from './utils/growthbook'

type GrowthbookABConfig = {
  fields: (string | FieldDefinition)[]
  environment: string
  project?: string
}

export const growthbookFieldLevel = definePlugin<GrowthbookABConfig>((config) => {
  const {fields, environment, project} = config
  return {
    name: 'sanity-growthbook-personalistaion-plugin-field-level-experiments',
    plugins: [
      fieldLevelExperiments({
        fields,
        experiments: (client) => getExperiments(client, environment, project),
      }),
    ],

    form: {
      components: {
        input: (props) => {
          const isRootInput = props.id === 'root' && isObjectInputProps(props)

          if (!isRootInput) {
            return props.renderDefault(props)
          }

          const flatFieldTypeNames = flattenSchemaType(props.schemaType).map(
            (field) => field.type.name,
          )

          const hasExperiment = flatFieldTypeNames.some((name) => name.startsWith('experiment'))

          if (!hasExperiment) {
            return props.renderDefault(props)
          }
          return Secrets(props)
        },
      },
    },
  }
})
