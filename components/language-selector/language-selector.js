import React, { Component } from 'react'
import { View, Text, TouchableHighlight } from 'react-native'



var languagesJSON = require('data/languages.json')

export class LanguageSelector extends Component {

    languageList() {

        let {languages} = languagesJSON

        return languages.map((language) => {

            let
                {flag, name} = language
                , {navigator} = this.props
                , route = { id: 'ipa-chart', language: name.toLowerCase() }

            return (
                <TouchableHighlight key={name} onPress={() => { navigator.push(route) } }>
                    <View>
                        <Text>{name}</Text> 
                    </View>
                </TouchableHighlight>
            )
        })

    }

    render() {
        return (
            <View>
                {this.languageList()}
            </View>
        )


    }
}