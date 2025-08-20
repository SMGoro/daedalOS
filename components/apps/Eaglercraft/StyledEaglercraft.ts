import styled from "styled-components";

const StyledEaglercraft = styled.div`
  height: ${({ theme }) => `calc(100% - ${theme.sizes.titleBar.height}px)`};
  width: 100%;
`;

export default StyledEaglercraft;
