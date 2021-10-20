/*!
 * @file ASR.ts
 * @brief DFRobot's ASR makecode library.
 * @details  This is a speech recognition module,
 * @n  [Get the module here](https://www.dfrobot.com.cn/goods-1802.html)
 * @copyright  Copyright (c) 2010 DFRobot Co.Ltd (http://www.dfrobot.com)
 * @license  The MIT License (MIT)
 * @author  [qsjhyy](yihuan.huang@dfrobot.com)
 * @version  V1.0
 * @date  2020-10-19
 */

// ASR 模块IIC通讯地址
const ASR_ADDRESSS = 0x4F

/**
 * 只能识别汉字，将要识别的汉字转换成拼音字母，每个汉字之间空格隔开，比如：开始 --> kai shi
 * 最多添加50个词条，每个词条最长为72个字符，每个词条最多10个汉字
 * 每个词条都对应一个识别号（1~255随意设置）不同的语音词条可以对应同一个识别号，
 */
const ASR_BEGIN          = 0xA1
const ASR_ADDCOMMAND     = 0xA2
const ASR_ADDCOMMAND_END = 0xA3
const ASR_START          = 0xA4
const ASR_LOOP           = 0xA5
const ASR_BUTTON         = 0xA7
const ASR_PASSWORD       = 0xA6
const ASR_IDLE           = 0xA8
const ASR_MIC_MODE       = 0xA9
const ASR_MONO_MODE      = 0xAA
const ASR_SET_IIC_ADDR   = 0xAB

/**
 * ASR blocks
 */
//% weight=100 color=#0fbcff block="ASR"
namespace ASR {
    let _mode: ModeEnum
    let idle = 0
    let commandBuf = pins.createBuffer(1)

    /**
     * @enum  ModeEnum
     * @brief 三种识别模式
     */
    export enum ModeEnum {
        //% block="LOOP"
        LOOP,
        //% block="PASSWORD"
        PASSWORD,
        //% block="BUTTON"
        BUTTON
    }

    /**
     * @enum  MicrophoneModeEnum
     * @brief  麦克风选择
     */
    export enum MicrophoneModeEnum {
        //% block="MIC"
        MIC,
        //% block="MONO"
        MONO
    }

    /**
     * TODO: 语音识别模块 初始化
     * @param e1 识别模式
     * @param e2 麦克风模式
     * @return 初始化成功返回true 失败返回false
     */
    //% blockId=begin block="begin ModeEnum %enum1 MicrophoneModeEnum %enum2"
    export function begin(enum1: ModeEnum, enum2: MicrophoneModeEnum): boolean {
        let ret = true
        _mode = enum1
        commandBuf[0] = ASR_BEGIN
        if(!writeReg(commandBuf))
            ret = false
        if (enum2 == MicrophoneModeEnum.MIC) {
            commandBuf[0] = ASR_MIC_MODE
            if (!writeReg(commandBuf))
                ret = false
        } else {
            commandBuf[0] = ASR_MONO_MODE
            if (!writeReg(commandBuf))
                ret = false
        }
        basic.pause(50)
        return ret
    }

    /**
     * TODO: 语音模块开始识别
     */
    //% blockId=start block="Start Speech Recognition"
    export function start(): void {
        writeValue(ASR_START)
        basic.pause(50)
    }

    /**
     * TODO: 向模块添加词条
     * @param words  代表词条的字符串
     * @param idNum  词条的识别号
     * @return bool值 成功返回 true, 失败返回 false
     */
    //% blockId=addCommand block="Add entries to modules|%words|The entry number is|%idNum"
    export function addCommand(words: string, idNum: number): boolean {
        let len = words.length, lenTemp, ret = true
        if (len > 72) 
            ret = false
        
        let buf1 = pins.createBuffer(3)
        buf1[0] = ASR_ADDCOMMAND
        buf1[1] = idNum
        buf1[2] = len
        if (!writeReg(buf1))
            ret = false

        while (len) {
            if (len > 28) {
                lenTemp = 28
            } else {
                lenTemp = len
            }
            let wordBuf = pins.createBuffer(lenTemp)
            for (let i = 0; i < lenTemp; i++) {
                wordBuf[i] = words.charCodeAt(i)
            }
            if (!writeReg(wordBuf))
                ret = false
            len -= lenTemp
            words.substr(lenTemp)
        }

        commandBuf[0] = ASR_ADDCOMMAND_END
        if (!writeReg(commandBuf))
            ret = false
        basic.pause(20)

        return ret
    }

    /**
     * TODO: 读取识别到的词条
     * @return 返回代表词条的识别号
     */
    //% blockId=read block="Recognition of a voice acquisition number"
    export function read(): number {
        let result = 0xFF
        switch (_mode) {
            case ModeEnum.BUTTON:
                writeValue(ASR_BUTTON)
                basic.pause(18)
                result = readValue()
                break
            case ModeEnum.LOOP:
                writeValue(ASR_LOOP)
                basic.pause(18)
                result = readValue()
                break
            case ModeEnum.PASSWORD:
                writeValue(ASR_PASSWORD)
                basic.pause(18)
                result = readValue()
                break
            default: break
        }
        // serial.writeLine("result: " + result)

        if (_mode == ModeEnum.PASSWORD) {
            idle++
            if (idle >= 500) {
                writeValue(ASR_IDLE)
                idle = 0
            }
        }
        if (result == 0xff) {
            return -1
        }
        else {
            idle = 0
            return result
        }
    }

    /**
     * TODO: 设置模块的i2c地址(掉电重启后生效)
     * @param addr  需要设置的i2c地址(0~127)
     */
    //% blockId=setI2CAddr block="Set the I2C address of the module (take effect after the power failure and restart)|%addr"
    export function setI2CAddr(addr: number): boolean {
        let ret = true
        if (addr > 127)
            ret = false
        let buf = pins.createBuffer(3)
        buf[0] = ASR_SET_IIC_ADDR
        buf[1] = addr
        if(!writeReg(buf))
            ret = false
        return ret
    }


    /**
     * TODO: 通过IIC总线写入单个数据
     * @param value 要写入的单个数据
     */
    function writeValue(value: number): void {
        pins.i2cWriteNumber(ASR_ADDRESSS, value, NumberFormat.UInt8LE)
    }

    /**
     * TODO: 通过IIC总线写入寄存器值
     * @param buf 要写入数据
     * @return 写入数据成功返回true 失败返回false
     */
    function writeReg(buf: Buffer): boolean {
        let ret = false
        if (0 == pins.i2cWriteBuffer(ASR_ADDRESSS, buf)) {
            ret = true
        }
        return ret
    }

    /**
     * TODO: 通过IIC总线读取寄存器值
     * @return  要读取单个的数据
     */
    function readValue(): number {
        let ret = pins.i2cReadNumber(ASR_ADDRESSS, NumberFormat.UInt8LE)
        return ret
    }
}
