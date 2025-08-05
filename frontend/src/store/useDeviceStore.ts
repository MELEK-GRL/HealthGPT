// src/store/useDeviceStore.ts
import { create } from 'zustand';
import { Dimensions } from 'react-native';

const BASE_WIDTH = 375; // iPhone X genişliği
const BASE_HEIGHT = 812; // iPhone X yüksekliği

interface DeviceState {
    width: number;
    height: number;
    w1px: number;
    h1px: number;
    fs1px: number;
    setDimensions: (width: number, height: number) => void;
}

const useDeviceStore = create<DeviceState>(set => {
    const { width, height } = Dimensions.get('window');
    const scaleWidth = width / BASE_WIDTH;
    const scaleHeight = height / BASE_HEIGHT;

    const w1px = scaleWidth;
    const h1px = scaleHeight;
    const fs1px = Math.min(scaleWidth, scaleHeight); // font boyutu için en küçük olan

    return {
        width,
        height,
        w1px,
        h1px,
        fs1px,
        setDimensions: (newWidth, newHeight) => {
            const newW1px = newWidth / BASE_WIDTH;
            const newH1px = newHeight / BASE_HEIGHT;
            const newFs1px = Math.min(newW1px, newH1px);

            set({
                width: newWidth,
                height: newHeight,
                w1px: newW1px,
                h1px: newH1px,
                fs1px: newFs1px,
            });
        },
    };
});

export default useDeviceStore;
