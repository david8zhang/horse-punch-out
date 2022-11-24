import { DEFAULT_BPM, WINDOW_WIDTH } from '~/core/Constants'

export const formInput = () => {
  return (
    <input
      style={{
        padding: '10px 10px',
        fontFamily: 'VCR',
        fontSize: '20px',
        width: WINDOW_WIDTH - 20,
      }}
      placeholder={`Enter a Youtube link for a ${DEFAULT_BPM} BPM song...`}
    />
  )
}
