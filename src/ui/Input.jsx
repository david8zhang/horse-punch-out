import { DEFAULT_BPM, WINDOW_WIDTH } from '~/core/Constants'

export const formInput = (placeholder, style = {}) => {
  return (
    <input
      id="youtube-searchbar"
      style={{
        padding: '10px 10px',
        fontFamily: 'VCR',
        fontSize: '20px',
        flex: '2',
        ...style,
      }}
      placeholder={placeholder}
    />
  )
}
