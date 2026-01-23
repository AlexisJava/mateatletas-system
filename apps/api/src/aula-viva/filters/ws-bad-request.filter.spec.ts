import { BadRequestException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { WsBadRequestExceptionFilter } from './ws-bad-request.filter';

describe('WsBadRequestExceptionFilter', () => {
  let filter: WsBadRequestExceptionFilter;

  beforeEach(() => {
    filter = new WsBadRequestExceptionFilter();
  });

  /**
   * Crea un mock de ArgumentsHost para WebSocket
   */
  function createMockWsHost() {
    const mockCallback = jest.fn();
    const mockClient = {
      emit: jest.fn(),
    };

    return {
      switchToWs: jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue(mockClient),
        getData: jest.fn().mockReturnValue({}),
        getPattern: jest.fn().mockReturnValue('test-event'),
      }),
      getType: jest.fn().mockReturnValue('ws'),
      getArgs: jest.fn().mockReturnValue([mockClient, mockCallback]),
      getArgByIndex: jest.fn(),
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      mockClient,
    };
  }

  it('should_transform_BadRequestException_to_WsException', () => {
    const host = createMockWsHost();
    const badRequest = new BadRequestException([
      'salaId debe ser un CUID válido',
    ]);

    // El filter llama a super.catch() que emite 'exception' al cliente
    filter.catch(badRequest, host as never);

    // Verificar que se emitió el evento 'exception' al cliente
    expect(host.mockClient.emit).toHaveBeenCalledWith(
      'exception',
      expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('CUID'),
        code: 'VALIDATION_ERROR',
      }),
    );
  });

  it('should_join_multiple_validation_messages', () => {
    const host = createMockWsHost();
    const badRequest = new BadRequestException([
      'salaId es requerido',
      'claseGrupoId debe ser un CUID válido',
    ]);

    filter.catch(badRequest, host as never);

    expect(host.mockClient.emit).toHaveBeenCalledWith(
      'exception',
      expect.objectContaining({
        message: 'salaId es requerido, claseGrupoId debe ser un CUID válido',
      }),
    );
  });

  it('should_handle_string_message_response', () => {
    const host = createMockWsHost();
    const badRequest = new BadRequestException('Error simple');

    filter.catch(badRequest, host as never);

    expect(host.mockClient.emit).toHaveBeenCalledWith(
      'exception',
      expect.objectContaining({
        message: 'Error simple',
      }),
    );
  });

  it('should_handle_object_response_with_message_string', () => {
    const host = createMockWsHost();
    const badRequest = new BadRequestException({ message: 'Mensaje objeto' });

    filter.catch(badRequest, host as never);

    expect(host.mockClient.emit).toHaveBeenCalledWith(
      'exception',
      expect.objectContaining({
        message: 'Mensaje objeto',
      }),
    );
  });
});
