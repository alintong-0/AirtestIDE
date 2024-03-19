# -*- coding: UTF-8 -*-
# https://stackoverflow.com/questions/14489013/simulate-python-keypresses-for-controlling-a-game

import ctypes
from ctypes.wintypes import DWORD, LONG, WORD, WPARAM
import win32con


# Extended keys and their corresponding scancodes
EXTENDED_KEYS = {
    'NUMPAD_ENTER': 0x9C,
    'RCTRL': 0x9D,
    'NUMPAD_/': 0xB5,
    'RALT': 0xB8,
    'HOME': 0xC7,
    'UP': 0xC8,
    'PAGE_UP': 0xC9,
    'LEFT': 0xCB,
    'RIGHT': 0xCD,
    'END': 0xCF,
    'DOWN': 0xD0,
    'PAGE_DOWN': 0xD1,
    'INSERT': 0xD2,
    'DELETE': 0xD3,
    'LWINDOWS': 0xDB,
    'RWINDOWS': 0xDC,
    'MENU': 0xDD
}

# Keys and their corresponding scancodes
KEYS = {
    'ESCAPE': 0x01,
    '1': 0x02,
    '2': 0x03,
    '3': 0x04,
    '4': 0x05,
    '5': 0x06,
    '6': 0x07,
    '7': 0x08,
    '8': 0x09,
    '9': 0x0A,
    '0': 0x0B,
    '-': 0x0C,
    '=': 0x0D,
    'BACKSPACE': 0x0E,
    'TAB': 0x0F,
    'Q': 0x10,
    'W': 0x11,
    'E': 0x12,
    'R': 0x13,
    'T': 0x14,
    'Y': 0x15,
    'U': 0x16,
    'I': 0x17,
    'O': 0x18,
    'P': 0x19,
    '[': 0x1A,
    ']': 0x1B,
    'ENTER': 0x1C,
    'LCTRL': 0x1D,
    'A': 0x1E,
    'S': 0x1F,
    'D': 0x20,
    'F': 0x21,
    'G': 0x22,
    'H': 0x23,
    'J': 0x24,
    'K': 0x25,
    'L': 0x26,
    ';': 0x27,
    "'": 0x28,
    '`': 0x29,
    'LSHIFT': 0x2A,
    'BACKSLASH': 0x2B,
    'Z': 0x2C,
    'X': 0x2D,
    'C': 0x2E,
    'V': 0x2F,
    'B': 0x30,
    'N': 0x31,
    'M': 0x32,
    ',': 0x33,
    '.': 0x34,
    '/': 0x35,
    'RSHIFT': 0x36,
    '*': 0x37,
    'LALT': 0x38,
    'SPACE': 0x39,
    'CAPS_LOCK': 0x3A,
    'F1': 0x3B,
    'F2': 0x3C,
    'F3': 0x3D,
    'F4': 0x3E,
    'F5': 0x3F,
    'F6': 0x40,
    'F7': 0x41,
    'F8': 0x42,
    'F9': 0x43,
    'F10': 0x44,
    'NUM_LOCK': 0x45,
    'SCROLL_LOCK': 0x46,
    'NUMPAD_7': 0x47,
    'NUMPAD_8': 0x48,
    'NUMPAD_9': 0x49,
    'NUMPAD_-': 0x4A,
    'NUMPAD_4': 0x4B,
    'NUMPAD_5': 0x4C,
    'NUMPAD_6': 0x4D,
    'NUMPAD_+': 0x4E,
    'NUMPAD_1': 0x4F,
    'NUMPAD_2': 0x50,
    'NUMPAD_3': 0x51,
    'NUMPAD_0': 0x52,
    'NUMPAD_.': 0x53,
    'F11': 0x57,
    'F12': 0x58,
    'PRINT_SCREEN': 0xB7,
    'PAUSE': 0xC5
}

KEYEVENTF_SCANCODE = 0x0008

# WPARAM is conditionally defined based on the pointer size.
ULONG_PTR = WPARAM


# https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/ns-winuser-keybdinput
class KeyBdInput(ctypes.Structure):
    """
    Contains information about a simulated keyboard event.
    """
    _fields_ = [('wVk', WORD),
                ('wScan', WORD),
                ('dwFlags', DWORD),
                ('time', DWORD),
                ('dwExtraInfo', ULONG_PTR)]


# https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/ns-winuser-mouseinput
class MouseInput(ctypes.Structure):
    """
    Contains information about a simulated mouse event.
    """
    _fields_ = [('dx', LONG),
                ('dy', LONG),
                ('mouseData', DWORD),
                ('dwFlags', DWORD),
                ('time', DWORD),
                ('dwExtraInfo', ULONG_PTR)]


# https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/ns-winuser-hardwareinput
class HardwareInput(ctypes.Structure):
    """
    Contains information about a simulated message generated by an input device
    other than a keyboard or mouse.
    """
    _fields_ = [('uMsg', DWORD),
                ('wParamL', WORD),
                ('wParamH', WORD)]


class _Input(ctypes.Union):
    _fields_ = [('ki', KeyBdInput),
                ('mi', MouseInput),
                ('hi', HardwareInput)]


# https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/ns-winuser-input
class Input(ctypes.Structure):
    """
    Used by SendInput to store information for synthesizing input events such
    as keystrokes, mouse movement, and mouse clicks.
    """
    _anonymous_ = ('_input',)
    _fields_ = [('type', DWORD),
                ('_input', _Input)]


def key_press(key):
    """Simulates a key press event.

    Sends a scancode to the computer to report which key has been pressed.
    Some games use DirectInput devices, and respond only to scancodes, not
    virtual key codes. You can simulate DirectInput key presses using this
    method, instead of the keyevent(...) method, which uses virtual key
    codes.

    :param key: A string indicating which key to be pressed.
                Available key options are listed in KEYS and EXTENDED_KEYS.
    """
    try:
        key_name = key.upper()
    except AttributeError:
        raise ValueError('invalid literal for key_press(): {}'.format(key))
    try:
        hex_code = KEYS[key_name]
    except KeyError:
        pass
    else:
        flags = KEYEVENTF_SCANCODE
        send_keyboard_input(hex_code, flags)
        return
    try:
        hex_code = EXTENDED_KEYS[key_name]
    except KeyError:
        raise ValueError('invalid literal for key_press(): {}'.format(key))
    else:
        flags = win32con.KEYEVENTF_EXTENDEDKEY | KEYEVENTF_SCANCODE
        send_keyboard_input(hex_code, flags)


def key_release(key):
    """Simulates a key release event.

    Sends a scancode to the computer to report which key has been released.
    Some games use DirectInput devices, and respond only to scancodes, not
    virtual key codes. You can simulate DirectInput key releases using this
    method. A call to the key_release(...) method usually follows a call to
    the key_press(..) method of the same key.

    :param key: A string indicating which key to be released.
    """
    try:
        key_name = key.upper()
    except AttributeError:
        raise ValueError('invalid literal for key_release(): {}'.format(key))
    try:
        hex_code = KEYS[key_name]
    except KeyError:
        pass
    else:
        flags = KEYEVENTF_SCANCODE | win32con.KEYEVENTF_KEYUP
        send_keyboard_input(hex_code, flags)
        return
    try:
        hex_code = EXTENDED_KEYS[key_name]
    except KeyError:
        raise ValueError('invalid literal for key_release(): {}'.format(key))
    else:
        flags = (win32con.KEYEVENTF_EXTENDEDKEY | KEYEVENTF_SCANCODE |
                 win32con.KEYEVENTF_KEYUP)
        send_keyboard_input(hex_code, flags)


def send_keyboard_input(hex_code, flags):
    """Simulates a key press/release event with SendInput.

    :param hex_code: Scancode of the particular key to be pressed/released in
                     hexadecimal.
    :param flags: Flags indicating various aspects of the keystroke.
    """
    inputs = Input(type=ctypes.c_ulong(win32con.INPUT_KEYBOARD),
                   ki=KeyBdInput(wScan=hex_code, dwFlags=flags))
    ctypes.windll.user32.SendInput(1, ctypes.byref(inputs),
                                   ctypes.sizeof(inputs))
