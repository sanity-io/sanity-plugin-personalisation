import {CloseIcon} from '@sanity/icons'
import {useCallback, useMemo} from 'react'
import {GiSoapExperiment} from 'react-icons/gi'
import {
  defineDocumentFieldAction,
  DocumentFieldActionItem,
  DocumentFieldActionProps,
  FormPatch,
  ObjectFieldProps,
  PatchEvent,
  set,
  unset,
} from 'sanity'
type PatchStuff = {onChange: (patch: FormPatch | FormPatch[] | PatchEvent) => void; inputId: string}

const useAddExperimentAction = (
  props: DocumentFieldActionProps & PatchStuff,
): DocumentFieldActionItem => {
  const patchActiveEvent = useMemo(() => {
    return set(true, ['active'])
  }, [])
  const handleAction = useCallback(() => {
    props.onChange([patchActiveEvent])
  }, [patchActiveEvent, props])

  return {
    title: 'Add experiment',
    type: 'action',
    icon: GiSoapExperiment,
    onAction: handleAction,
    renderAsButton: true,
  }
}

const useRemoveExperimentAction = (
  props: DocumentFieldActionProps & PatchStuff,
): DocumentFieldActionItem => {
  const patchActiveEvent = useMemo(() => {
    const activeId = ['active']
    return set(false, activeId)
  }, [])

  const patchClearEvent = useMemo(() => {
    const experimentId = ['experimentId'] // `${props.inputId}.experimentId`
    const variants = ['variants'] //`${props.inputId}.variants`
    return [unset(experimentId), unset(variants)]
  }, [])
  const handleAction = useCallback(() => {
    props.onChange([patchActiveEvent, ...patchClearEvent])
  }, [patchActiveEvent, patchClearEvent, props])

  return {
    title: 'Remove experiment',
    type: 'action',
    icon: CloseIcon,
    onAction: handleAction,
    renderAsButton: true,
  }
}

const newActions = ({onChange, inputId, active}: PatchStuff & {active?: boolean}) =>
  active
    ? defineDocumentFieldAction({
        name: 'Experiment',
        useAction: (props) => useRemoveExperimentAction({...props, onChange, inputId}),
      })
    : defineDocumentFieldAction({
        name: 'Experiment',
        useAction: (props) => useAddExperimentAction({...props, onChange, inputId}),
      })

export const ExperimentField = (props: ObjectFieldProps) => {
  const {onChange} = props.inputProps
  const {inputId} = props
  const active = props.value?.active as boolean | undefined

  const oldActions = props.actions || []

  const withActionProps = {
    ...props,
    actions: [newActions({onChange, inputId, active}), ...oldActions],
  }
  return props.renderDefault(withActionProps)
}
