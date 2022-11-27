import { WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/Constants'

export const ScrollList = (items) => {
  return (
    <div
      style={{
        overflowY: 'scroll',
        padding: '0px 20px',
        scrollbarWidth: 'none',
        height: `${WINDOW_HEIGHT - 200}px`,
        color: 'white',
      }}
    >
      {items.map((item) => {
        return (
          <p
            style={{ cursor: 'pointer', userSelect: 'none', fontFamily: 'VCR' }}
          >
            {item.name}
          </p>
        )
      })}
    </div>
  )
}
