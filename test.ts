/*!
 * @file test.ts
 * @brief 语音识别，有三种模式.
 * @n 1.循环模式: 会一直循环地识别目标词条，直到成功识别
 * @n 2.按钮模式: 按一下按钮才会开始识别，再按一次按钮结束识别
 * @n 3.指令模式：第一个词条为指令，传感器只有识别到第一个词条才会正常开始工作，
 * @n            若无输入，传感器会在十秒内进入空闲模式，需要再次输入指令
 * @copyright  Copyright (c) 2010 DFRobot Co.Ltd (http://www.dfrobot.com)
 * @license  The MIT License (MIT)
 * @author  [qsjhyy](yihuan.huang@dfrobot.com)
 * @version  V1.0
 * @date  2020-10-19
 */
// 在此处测试；当此软件包作为插件使用时，将不会编译此软件包。
{
    let result = 0
    while (!(ASR.begin(ASR.ModeEnum.PASSWORD, ASR.MicrophoneModeEnum.MIC))) {
        serial.writeLine("Communication with device failed, please check connection")
        basic.pause(2000)
    }
    serial.writeLine("Begin ok!")
    /*!
     * 只能识别汉字，将要识别的汉字转换成拼音字母，每个汉字之间空格隔开，比如：开始 --> kai shi
     * 最多添加50个词条，每个词条最长为72个字符，每个词条最多10个汉字
     * 每个词条都对应一个识别号（1~255随意设置）不同的语音词条可以对应同一个识别号，
     */
    if (ASR.addCommand("xiao zhi", 0)) {   //在指令模式下，第一个词组效果为激活设备语音识别
        serial.writeLine("Set key words xiao zhi succeed!")
    }
    if (ASR.addCommand("kai deng", 1)) {
        serial.writeLine("Set key words kai deng succeed!")
    }
    if (ASR.addCommand("guan deng", 2)) {
        serial.writeLine("Set key words guan deng succeed!")
    }
    ASR.start()
    serial.writeLine("Start speech recognition!")
    basic.showLeds(`
    . . . . .
    . # # # .
    . # # # .
    . # # # .
    . . . . .
    `)
    led.enable(false)
    while (true) {
        result = ASR.read()
        if (1 == result) {
            serial.writeLine("received'kai deng',command flag'1'")
            led.enable(true)
        } else if (2 == result) {
            serial.writeLine("received'guan deng',command flag'2'")
            led.enable(false)
        }
        basic.pause(200)
    }
}