import { memo, useEffect, useRef, useState } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledLoading from "components/system/Apps/StyledLoading";
import { useProcesses } from "contexts/process";
import { IFRAME_CONFIG } from "utils/constants";

const Eaglercraft: FC<ComponentProcessProps> = ({ id }) => {
  const {
    linkElement,
    processes: { [id]: { libs: [eaglercraftSrc = ""] = [] } = {} } = {},
  } = useProcesses();
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (loaded && iframeRef.current) {
      linkElement(id, "peekElement", iframeRef.current);
    }
  }, [id, linkElement, loaded]);

  return (
    <div>
      {!loaded && <StyledLoading />}
      <iframe
        ref={iframeRef}
        height="100%"
        onLoad={() => setLoaded(true)}
        src={eaglercraftSrc}
        title={id}
        width="100%"
        {...IFRAME_CONFIG}
      />
    </div>
  );
};

export default memo(Eaglercraft);
