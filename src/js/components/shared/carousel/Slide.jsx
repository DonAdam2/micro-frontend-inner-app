//custom hooks
import useTilt from '../../../customHooks/UseTilt';

const Slide = ({ image, title, subtitle, description, offset, isPageBackground }) => {
  const active = offset === 0,
    ref = useTilt();

  return (
    <div
      className="slide"
      data-active={active || undefined}
      aria-hidden={active ? undefined : true}
      style={{
        '--offset': offset,
        '--dir': offset === 0 ? 0 : offset > 0 ? 1 : -1,
      }}
    >
      {isPageBackground && (
        <div
          className="slideBackground"
          style={{
            backgroundImage: `url('${image}')`,
          }}
        />
      )}
      <div
        ref={ref}
        className="slideContent"
        style={{
          backgroundImage: `url('${image}')`,
        }}
      >
        <div className="slideContentInner">
          {title && (
            <h2 className="slideTitle" dir="auto">
              {title}
            </h2>
          )}
          {subtitle && (
            <h3 className="slideSubtitle" dir="auto">
              {subtitle}
            </h3>
          )}
          {description && (
            <p className="slideDescription" dir="auto">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Slide;
