import * as core from './core'
import * as scrypt from './scrypt'
import { ab2hexstring, hexstring2ab } from './utils'
import {DEFAULT_ALGORITHM} from './consts'
import {ERROR_CODE} from './error'

export class ControlData {
    algorithm: string;
    parameters: {
        curve: string;
    };
    id: string;
    key: string;
}

export class Identity {

    ontid: string;
    label: string;
    isDefault: boolean;
    lock: boolean;
    controls: Array<ControlData> = [];
    extra: null;

    //why not put in controlData
    privateKey: Array<string> = [""];
    wifKey: Array<string> = [""];

    constructor() {
    }

    create( privateKey: string, keyphrase: string, label: string, algorithmObj ?: any ) {
        this.privateKey[0] = privateKey;
        //console.log( "privateKey:",this.privateKey[0] );

        this.wifKey[0] = core.getWIFFromPrivateKey( privateKey );
        //console.log( "wifKey:",this.wifKey[0] );

        this.ontid = "";
        this.label = label;
        this.isDefault = false;
        this.lock = false;

        // control
        let control = (<ControlData> {})

        //algorithm
        if (algorithmObj) {
            control.algorithm = algorithmObj.algorithm
            control.parameters = algorithmObj.parameters
        } else {
            control.algorithm = DEFAULT_ALGORITHM.algorithm
            control.parameters = DEFAULT_ALGORITHM.parameters
        }

        //generate id too simple?
        control.id = "1";
        control.key = scrypt.encrypt( this.wifKey[0], keyphrase );

        this.controls.push( control );

        // ontid
        let publicKeyEncoded = ab2hexstring( core.getPublicKey( privateKey, true ) );
        let signatureScript = core.createSignatureScript( publicKeyEncoded );
        let programHash = core.getHash( signatureScript );
        this.ontid = "did:ont:" + core.toAddress( programHash );
        //TODO register ontid
        //调用方处理register和监听结果
        return this
    }

    static importIdentity(identityDataStr : string ,encryptedPrivateKey : string, password : string, 
        ontid : string) : Identity {
        let identity = new Identity()
        let wifKey = scrypt.decrypt(encryptedPrivateKey, password);
        if (!wifKey) {
            throw ERROR_CODE.Decrypto_ERROR
        }
        let privateKey = core.getPrivateKeyFromWIF(wifKey)
        //TODO check ontid
        //if not exist 
        //throw tx error
        //if ontid exist
        // return checkOntid(ontid, privateKey).then((res : any)=>{
        //     //ontid exist, handle here

        // }, (err : any) => {
        //     //not exist
        // })
        if(identityDataStr) {
            return Identity.parseJson(identityDataStr)
        } else {
            let identity = new Identity()
            identity.ontid = ontid
            identity.label = '';
            identity.isDefault = false;
            identity.lock = false; 
            identity.privateKey[0] = privateKey;
            //console.log( "privateKey:",this.privateKey[0] );

            identity.wifKey[0] = wifKey;
            let control = (<ControlData>{})
            control.id = '1'
            control.algorithm = DEFAULT_ALGORITHM.algorithm
            control.parameters = DEFAULT_ALGORITHM.parameters
            control.key = scrypt.encrypt(wifKey, password)
            identity.controls.push(control)
            return identity
        }
    }

    toJson(): string {
        let obj = {
            ontid: this.ontid,
            label: this.label,
            isDefault: this.isDefault,
            lock: this.lock,
            controls: this.controls,
            extra: this.extra,

            //why not put in controlData
            privateKey: this.privateKey,
            wifKey: this.wifKey
        }
        return JSON.stringify(obj)
    }

    static parseJson(json: string): Identity {
        let obj = JSON.parse(json)
        let id = new Identity()
        id.ontid = obj.ontid
        id.label = obj.label
        id.isDefault = obj.isDefault
        id.lock = obj.lock
        id.controls = obj.controls
        id.extra = obj.extra
        id.privateKey = obj.privateKey
        id.wifKey = obj.wifKey
        return id;
    }

    //TODO
    async registerOntid()  {

        return true
    }

    //TODO
    checkOntid() : boolean {
        return true
    }

}

