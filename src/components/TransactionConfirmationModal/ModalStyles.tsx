import { styled } from '@mui/material';

import { AutoColumn, ColumnCenter } from 'components/Column';

export const Wrapper = styled('div')`
  overflow: hidden;
  border-radius: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 40px);
  max-width: 420px;
  padding: 32px;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg1}, ${
    theme.palette.customBackground.bg1
  }) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 35%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
`;

export const BottomSection = styled(AutoColumn)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

export const CustomWrapper = styled(AutoColumn)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ConfirmedIcon = styled(ColumnCenter)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '20px 0' : '32px 0;')};
  position: relative;
`;

export const StyledLogo = styled('img')`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`;

export const ConfirmationModalContentWrapper = styled(AutoColumn)`
  padding-bottom: 12px;
`;
