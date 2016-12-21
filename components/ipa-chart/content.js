import React, { Component, PropTypes } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { H1, H2 } from 'components/reusable-components/typography.js'

var Sound = require('react-native-sound');

const objectContent = require('data/german.json')

export class Content extends Component {

    render() {

        const {selectedContent, currentLanguage, style} = this.props

            , properties = {
                speechSound: selectedContent,
                currentLanguage
            }

        return (
            <View style={[style, {
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }]}>
                <IPASymbols {...properties} />
            </View>
        )

    }
}


Content.propTypes = {
    selectedContent: PropTypes.string.isRequired,
    currentLanguage: PropTypes.string.isRequired
}

class IPASymbols extends Component {

    constructor() {
        super()

        this.cleanIPASelection = {
            audio: null,
            selectedIPA: '',
            wordExample: '',
            nextAudioExecution: null
        }

        this.state = Object.assign({}, this.cleanIPASelection)
    }

    destroyOldIPASelection() {
        this.destroyOldAudioExecution()
        this.setState(Object.assign({}, this.cleanIPASelection))
    }

    loadSound({description, audioPath, type}) {

        return new Promise((resolve, reject) => { 

            var audioResource = new Sound(audioPath, '', (error) => {
                if (error) { 
                    console.log(error, audioPath); 
                    reject(error); return 
                }
                audioResource.setVolume(1)
                resolve({ description, audioResource, type })
            });

        })
    }

    destroyOldAudioExecution() {
        clearTimeout(this.state.nextAudioExecution)
    }

    loadAllSounds({loadExamples = false, IPASymbol}) {

        const

            {speechSound} = this.props

            , {examples = null, name, sound} = objectContent[speechSound][IPASymbol]

            , IPAname = name, IPAsound = sound

            , self = this


        let audiosToLoad = [{ description: IPAname, audioPath: IPAsound, type: 'ipa' }]


        if (examples && loadExamples) {

            let audioExamples = examples.map((example) => {
                let {sound, word} = example

                return { audioPath: sound, description: word, type: 'example' }
            })

            audiosToLoad = Object.assign([], [].concat(audiosToLoad, audioExamples))

        }


        let audiosLoading = audiosToLoad.map((audio) => {
            return this.loadSound(audio)
        })


        return Promise.all(audiosLoading).then((loadedAudios) => loadedAudios, (error) => error)

    }

    releaseLastAudio() {
        const storedAudio = this.state.audio
        if (storedAudio) storedAudio.release()
    }

    playAudiosSequentially(audios) {

        let self = this

        this.releaseLastAudio()        

        if (audios.length) {

            let {audioResource, type, description} = audios[0]

            this.changeDescription({ description, typeOfDescription: type })

            let duration = audioResource.getDuration() * 1000

                , nextAudios = audios.slice(1, audios.length)

                , nextAudioExecution

                , newState = {}

            // console.log(audioResource) 

            audioResource.play()


            nextAudioExecution = setTimeout(function () { self.playAudiosSequentially(nextAudios) }, duration)


            this.setState({ audio: audioResource, nextAudioExecution })


        } else {
            // this.destroyOldIPASelection()
        }

    }


    changeDescription({description, typeOfDescription}) {

        let stateToAlter = '', newState = {}

        if (typeOfDescription === 'example') stateToAlter = 'wordExample'
        else if (typeOfDescription === 'ipa') stateToAlter = 'selectedIPA'

        newState[stateToAlter] = description

        this.setState(newState)

    }



    onSelectedSymbol({IPASymbol, playExamples = false}) {

        this.destroyOldIPASelection()

        const onLoaded = (audiosLoaded) => {
            this.playAudiosSequentially(audiosLoaded)
        }

        const onError = (error) => {            
            console.log(error)
        }

        this.loadAllSounds({ loadExamples: playExamples, IPASymbol }).then(onLoaded, onError)

    }


    content() {

        const {speechSound} = this.props
            , content = objectContent[speechSound]
            , width = 47
            , style = { width, height: width }
            , symbols = []
            , self = this

        for (let IPASymbol in content) {

            let {examples = null} = content[IPASymbol]

            //if there the sound (IPASymbol) in the currentLanguage, render it.
            if (examples) {

                const

                    properties = {
                        key: IPASymbol,
                        style,
                        onPress: function onPress() {
                            self.onSelectedSymbol({ IPASymbol, playExamples: true })
                        }
                    }

                    , ipaSound = (
                        <TouchableOpacity {...properties}>
                            <View>
                                <Text style={{ fontFamily: 'Roboto', fontSize: 25, textAlign: 'center', color: '#455A64' }}>{IPASymbol}</Text>
                            </View>
                        </TouchableOpacity>
                    )

                symbols.push(ipaSound)

            }

        }

        return symbols

    }

    render() {

        const layout = { flex: 2, flexDirection: 'row', flexWrap: 'wrap' }
            , boxStyle = { flex: 1.2, flexDirection: 'column', justifyContent: 'center' }
            , headerAligment = { textAlign: 'center' }

        return (

            <View style={{ alignItems: 'center' }}>

                <View style={boxStyle}>
                    <H1 style={[headerAligment, { height: 35, marginBottom: 10, color: '#F44336' }]}>{this.state.selectedIPA}</H1>
                    <H2 style={[headerAligment, { height: 25, color: '#455A64' }]}>{this.state.wordExample}</H2>
                </View>

                <View style={layout}>
                    {this.content()}
                </View>
            </View>

        )

    }
}

