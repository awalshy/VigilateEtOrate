import React, { useState } from 'react'
import {
  Text,
  View,
  Share,
  Vibration,
  StyleSheet,
  TextInput
} from 'react-native'
import { Feather } from '@expo/vector-icons'

import Modal from 'components/layout/Modal'
import { TIntention } from 'config/types/Intention'
import { WriteIntention, IntentionCard } from 'components/intentions/Blocks'
import theme from 'config/theme'
import { connect, useDispatch } from 'react-redux'
import { RootState } from 'red/reducers/RootReducer'
import {
  postIntention,
  removeIntentions,
  updateIntention
} from 'utils/api/api_firebase'
import {
  addIntentions,
  deleteIntentions,
  updateIntentions
} from 'red/actions/IntentionsActions'
import Page from 'components/layout/Page'

const IntentionsScreen = ({
  intentions,
  userId
}: {
  intentions: TIntention[]
  userId: string | undefined
}): JSX.Element => {
  const dispatch = useDispatch()
  const [open, openModal] = useState(false)
  const [selectedIntention, setSI] = useState<TIntention>()
  const [edit, setEdit] = useState(false)
  const [intentionEdit, setIE] = useState('')

  const addIntention = async (intention: string) => {
    await postIntention(intention, userId)
    dispatch(addIntentions(intention, userId))
  }
  const deleteIntention = async () => {
    if (!selectedIntention) return
    removeIntentions(selectedIntention.id)
    dispatch(deleteIntentions(selectedIntention))
    openModal(false)
  }
  const editIntention = async () => {
    setIE(selectedIntention?.intention || '')
    setEdit(!edit)
  }
  const updateInt = async () => {
    if (!selectedIntention) return
    const intTmp = intentions
    const index = intTmp.findIndex((i) => i.id === selectedIntention.id)
    intTmp[index].intention = intentionEdit
    dispatch(updateIntentions(intTmp))
    updateIntention(intTmp[index])
    setEdit(false)
  }
  const shareIntention = async () => {
    try {
      await Share.share({
        message: `Ajouter à mes intentions: ${selectedIntention?.intention}`
      })
      openModal(false)
    } catch (e) {
      console.error(e.message)
    }
  }
  const focusIntention = (id: string) => {
    const int = intentions.find((i) => i.id == id)
    setSI(int)
    openModal(true)
    Vibration.vibrate(20)
  }

  return (
    <Page
      title="Mes Intentions"
      backgroundColor={theme.colors.green}
      foregroundColor={theme.colors.blue}
    >
      <Modal
        open={open}
        onClose={() => {
          Vibration.vibrate(20)
          openModal(!open)
          setEdit(false)
        }}
      >
        <View style={styles.container}>
          <View style={styles.actions}>
            <Feather.Button
              backgroundColor={theme.colors.blue}
              name="trash"
              size={20}
              onPress={deleteIntention}
            />
            <Feather.Button
              backgroundColor={theme.colors.blue}
              name="edit-3"
              size={20}
              onPress={editIntention}
            />
            <Feather.Button
              backgroundColor={theme.colors.blue}
              name="share-2"
              size={20}
              onPress={shareIntention}
            />
            {edit && (
              <Feather.Button
                backgroundColor={theme.colors.blue}
                name="save"
                size={20}
                onPress={updateInt}
              >
                Sauvegarderr
              </Feather.Button>
            )}
          </View>
          {edit ? (
            <TextInput
              value={intentionEdit}
              onChangeText={setIE}
              style={styles.inputEditing}
              multiline
            />
          ) : (
            <Text style={styles.modalText}>{selectedIntention?.intention}</Text>
          )}
        </View>
      </Modal>
      <View>
        {intentions &&
          intentions.map((int) => (
            <IntentionCard
              key={int.id}
              intention={int}
              onLongPress={() => focusIntention(int.id)}
            />
          ))}
      </View>
      <WriteIntention addIntention={addIntention} />
    </Page>
  )
}

const styles = StyleSheet.create({
  modalText: {
    fontSize: 14,
    color: theme.colors.white
  },
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  actions: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginBottom: 15
  },
  inputEditing: {
    borderColor: theme.colors.white + '12',
    borderWidth: 1,
    width: '100%',
    color: theme.colors.white,
    paddingHorizontal: 5
  }
})

const mapToProps = (state: RootState) => ({
  intentions: state.intentions.intentions,
  userId: state.user.user?.id
})

export default connect(mapToProps)(IntentionsScreen)
