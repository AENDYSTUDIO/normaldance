// Заглушка для тестов
const useAudioStore = () => ({
  isPlaying: false,
  volume: 70,
  currentTrack: null,
  togglePlay: jest.fn(),
  setVolume: jest.fn(),
  setCurrentTrack: jest.fn(),
});

export default useAudioStore;
export { useAudioStore };
